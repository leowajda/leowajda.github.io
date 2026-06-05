import { replaceHashValue } from "./dom.js"
import { decorateInspector, renderMathIn } from "./eureka-flowchart-inspector.js"
import { buildRoute, resolveFlowchartNodeId } from "./eureka-flowchart-state.js"

const queryTemplate = (root, nodeId) =>
  root.querySelector(`template[data-flowchart-template="${CSS.escape(nodeId)}"]`)

export const createFlowchartSelectionController = ({
  root,
  inspector,
  inspectorContent,
  metadata,
  state,
  nodeStateRenderer,
  viewport,
  supportsHover
}) => {
  const { choicesBySource, nodeMeta } = metadata
  let focusSequence = 0

  const replaceHash = (nodeId) => {
    replaceHashValue(nodeId)
  }

  const interruptViewportFocus = () => {
    focusSequence += 1
  }

  const hideInspector = () => {
    inspector.hidden = true
    root.classList.add("flowchart-workspace--empty")
  }

  const renderInspector = (nodeId) => {
    const template = queryTemplate(root, nodeId)
    if (!template) {
      return
    }

    const route = buildRoute(nodeMeta, nodeId)
    const choices = choicesBySource.get(nodeId) || []
    const nextContent = template.content.cloneNode(true)
    decorateInspector(nextContent, {
      route,
      choices,
      activePanelName: state.activePanel,
      onActivePanelChange: (panelName) => {
        state.activePanel = panelName
      },
      onSelectRouteNode: (routeNodeId) => {
        commitSelection(routeNodeId, { focus: true })
      }
    })
    inspectorContent.replaceChildren(nextContent)
    renderMathIn(inspectorContent)
    inspector.hidden = false
    root.classList.remove("flowchart-workspace--empty")
  }

  const scheduleViewportFocus = (nodeId, options = {}) => {
    const currentSequence = ++focusSequence
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (currentSequence !== focusSequence || state.selectedId !== nodeId) {
          return
        }

        viewport.focusNode(nodeId, options)
      })
    })
  }

  const commitSelection = (nodeId, { updateHash = true, focus = true, immediate = false } = {}) => {
    nodeId = resolveFlowchartNodeId(metadata, nodeId)
    if (!nodeMeta.has(nodeId)) {
      return
    }

    state.selectedId = nodeId
    state.previewId = null
    renderInspector(nodeId)
    nodeStateRenderer.render()

    if (focus) {
      scheduleViewportFocus(nodeId, { immediate })
    }

    if (updateHash) {
      replaceHash(nodeId)
    }
  }

  const clearSelection = ({ updateHash = true } = {}) => {
    interruptViewportFocus()
    state.selectedId = ""
    state.previewId = null
    viewport.cancel()
    hideInspector()
    nodeStateRenderer.render()

    if (updateHash) {
      replaceHash("")
    }
  }

  const previewNode = (nodeId) => {
    nodeId = resolveFlowchartNodeId(metadata, nodeId)
    if (!supportsHover || nodeId === state.selectedId || !nodeMeta.has(nodeId)) {
      return
    }

    state.previewId = nodeId
    renderInspector(nodeId)
    nodeStateRenderer.render()
  }

  const clearPreview = () => {
    if (!supportsHover || !state.previewId) {
      return
    }

    state.previewId = null
    if (state.selectedId) {
      renderInspector(state.selectedId)
    } else {
      hideInspector()
    }
    nodeStateRenderer.render()
  }

  return {
    clearPreview,
    clearSelection,
    commitSelection,
    hideInspector,
    interruptViewportFocus,
    previewNode,
    selectedId() {
      return state.selectedId
    }
  }
}
