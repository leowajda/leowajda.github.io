export const attachFlowchartPan = ({
  root,
  viewport,
  viewportController,
  state,
  renderStableSelection,
  renderNodeState
}) => {
  const endDrag = () => {
    root.classList.remove("is-dragging")
    if (state.isDragging) {
      state.suppressClick = true
      window.setTimeout(() => {
        state.suppressClick = false
      }, 0)
    }

    if (state.pointerId !== null && viewport.hasPointerCapture?.(state.pointerId)) {
      viewport.releasePointerCapture(state.pointerId)
    }

    state.pointerDown = false
    state.pointerId = null
    state.isDragging = false
  }

  viewport.addEventListener("pointerdown", (event) => {
    if (!viewportController.canPan() || event.button !== 0) {
      return
    }

    if (event.target instanceof Element && event.target.closest("[data-flowchart-node]")) {
      return
    }

    state.pointerDown = true
    state.pointerId = event.pointerId
    state.dragStartX = event.clientX
    state.dragStartY = event.clientY
    state.dragStartLeft = viewport.scrollLeft
    state.dragStartTop = viewport.scrollTop
    state.isDragging = false
    viewport.setPointerCapture?.(event.pointerId)
  })

  viewport.addEventListener("pointermove", (event) => {
    if (!state.pointerDown || event.pointerId !== state.pointerId) {
      return
    }

    const deltaX = event.clientX - state.dragStartX
    const deltaY = event.clientY - state.dragStartY

    if (!state.isDragging && (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6)) {
      state.isDragging = true
      root.classList.add("is-dragging")
      state.previewId = null
      renderStableSelection()
      renderNodeState()
    }

    if (!state.isDragging) {
      return
    }

    viewport.scrollLeft = state.dragStartLeft - deltaX
    viewport.scrollTop = state.dragStartTop - deltaY
    event.preventDefault()
  })

  const handlePointerFinish = (event) => {
    if (state.pointerDown && event.pointerId === state.pointerId) {
      endDrag()
    }
  }

  viewport.addEventListener("pointerup", handlePointerFinish)
  viewport.addEventListener("pointercancel", handlePointerFinish)
  viewport.addEventListener("lostpointercapture", () => {
    if (state.pointerDown) {
      endDrag()
    }
  })

  window.addEventListener("blur", () => {
    if (state.pointerDown) {
      endDrag()
    }
  })
}
