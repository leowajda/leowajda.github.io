const closestElement = (target, selector) =>
  target instanceof Element ? target.closest(selector) : null

const zoomPercent = (scale) => Math.round(scale * 100)

export const createZoomControls = (root, {
  onResetZoom,
  onSetZoom,
  onStepZoom
} = {}) => {
  const container = root.querySelector("[data-flowchart-zoom-controls]")
  const range = root.querySelector("[data-flowchart-zoom-range]")
  const stepButtons = [...root.querySelectorAll("[data-flowchart-zoom-step]")]
  const value = root.querySelector("[data-flowchart-zoom-value]")

  const setHidden = (hidden) => {
    if (container) {
      container.hidden = hidden
    }
  }

  const sync = (viewportState) => {
    if (!container || !viewportState) {
      return
    }

    const percent = zoomPercent(viewportState.scale)
    const minPercent = zoomPercent(viewportState.minScale)
    const maxPercent = zoomPercent(viewportState.maxScale)

    container.dataset.flowchartZoomMode = viewportState.mode

    if (range) {
      range.min = minPercent.toString()
      range.max = maxPercent.toString()
      range.value = percent.toString()
    }

    if (value) {
      value.textContent = `${percent}%`
      value.value = `${percent}%`
    }

    stepButtons.forEach((button) => {
      const direction = Number.parseInt(button.dataset.flowchartZoomStep || "0", 10)
      button.disabled = (direction < 0 && percent <= minPercent) || (direction > 0 && percent >= maxPercent)
    })
  }

  range?.addEventListener("input", (event) => {
    const target = event.currentTarget
    if (target instanceof HTMLInputElement && typeof onSetZoom === "function") {
      onSetZoom(Number.parseInt(target.value, 10) / 100)
    }
  })

  container?.addEventListener("click", (event) => {
    const stepButton = closestElement(event.target, "[data-flowchart-zoom-step]")
    if (stepButton && typeof onStepZoom === "function") {
      onStepZoom(Number.parseInt(stepButton.dataset.flowchartZoomStep || "0", 10))
      return
    }

    if (closestElement(event.target, "[data-flowchart-zoom-reset]") && typeof onResetZoom === "function") {
      onResetZoom()
    }
  })

  return {
    contains(target) {
      return target instanceof Node && container?.contains(target) === true
    },
    setHidden,
    sync
  }
}
