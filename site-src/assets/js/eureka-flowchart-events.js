import { getHashValue } from "./dom.js"
import { resolveFlowchartNodeId } from "./eureka-flowchart-state.js"

const closestElement = (target, selector) =>
  target instanceof Element ? target.closest(selector) : null

const containsRelatedTarget = (element, relatedTarget) =>
  relatedTarget instanceof Node && element.contains(relatedTarget)

export const bindFlowchartEvents = ({
  surface,
  viewportElement,
  graph,
  metadata,
  selection,
  viewport,
  zoomControls
}) => {
  const { nodeMeta } = metadata

  graph.on("node:click", ({ node }) => {
    selection.commitSelection(node.id)
  })

  graph.on("blank:click", () => {
    selection.clearSelection()
  })

  graph.on("node:mouseenter", ({ node }) => {
    selection.previewNode(node.id)
  })

  graph.on("node:mouseleave", () => {
    selection.clearPreview()
  })

  surface.addEventListener("click", (event) => {
    const button = closestElement(event.target, "[data-flowchart-node]")
    if (button && event.detail === 0) {
      selection.commitSelection(button.dataset.flowchartNodeId || "")
    }
  })

  surface.addEventListener("focusin", (event) => {
    const button = closestElement(event.target, "[data-flowchart-node]")
    if (button) {
      selection.previewNode(button.dataset.flowchartNodeId || "")
    }
  })

  surface.addEventListener("focusout", (event) => {
    const button = closestElement(event.target, "[data-flowchart-node]")
    if (button && !containsRelatedTarget(button, event.relatedTarget)) {
      selection.clearPreview()
    }
  })

  surface.addEventListener("wheel", (event) => {
    if (viewport.zoomFromWheel(event)) {
      selection.interruptViewportFocus()
    }
  }, { passive: false })

  surface.addEventListener("pointerdown", (event) => {
    if (event.button === 0 && !closestElement(event.target, "[data-flowchart-node]")) {
      selection.interruptViewportFocus()
      viewport.cancel()
    }
  })

  if (viewportElement) {
    viewportElement.addEventListener("keydown", (event) => {
      if (zoomControls?.contains(event.target) || event.altKey || event.ctrlKey || event.metaKey) {
        return
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault()
        selection.interruptViewportFocus()
        viewport.stepZoom(1)
      } else if (event.key === "-") {
        event.preventDefault()
        selection.interruptViewportFocus()
        viewport.stepZoom(-1)
      } else if (event.key === "0") {
        event.preventDefault()
        selection.interruptViewportFocus()
        viewport.resetAuto({ selectedNodeId: selection.selectedId() })
      }
    })
  }

  window.addEventListener("hashchange", () => {
    const hashNodeId = resolveFlowchartNodeId(metadata, getHashValue())
    if (hashNodeId && nodeMeta.has(hashNodeId)) {
      if (hashNodeId === selection.selectedId()) {
        return
      }

      selection.commitSelection(hashNodeId, { updateHash: false })
      return
    }

    selection.clearSelection({ updateHash: false })
  })

  window.addEventListener("resize", () => {
    selection.interruptViewportFocus()
    viewport.cancel()
    if (selection.selectedId()) {
      viewport.refocusSelected(selection.selectedId())
    } else {
      viewport.positionStart({ preserveScale: viewport.isManual() })
    }
  })
}
