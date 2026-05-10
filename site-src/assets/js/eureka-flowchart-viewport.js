import { clampNumber, toNumber } from "./eureka-flowchart-geometry.js"

const FLOWCHART_CONTENT_PADDING = 24
const ZOOM_MAX = 1.38
const ZOOM_MIN = 0.32
const ZOOM_ANIMATION_MS = 220
const FOCUS_ANIMATION_MS = 520
const RESIZE_FOCUS_ANIMATION_MS = 180
const WHEEL_ZOOM_MAX_DELTA = 240
const WHEEL_ZOOM_SENSITIVITY = 0.0007
const WHEEL_DELTA_LINE = 1
const WHEEL_DELTA_PAGE = 2
const WHEEL_DELTA_LINE_PIXELS = 16
const WHEEL_DELTA_PAGE_PIXELS = 800
const FOCUS_SCALE = 0.78
const ZOOM_CONTROL_STEP = 0.08
const ZOOM_MODE_AUTO = "auto"
const ZOOM_MODE_MANUAL = "manual"

const usesMobileViewport = () => window.matchMedia("(max-width: 820px)").matches

const preferredScale = (graphData) => {
  const chart = graphData.chart || {}
  const desktopScale = toNumber(chart.scale_desktop, 1)
  const mobileScale = toNumber(chart.scale_mobile, desktopScale)
  return usesMobileViewport() ? mobileScale : desktopScale
}

const viewportCenter = (surface) => ({
  x: surface.clientWidth / 2,
  y: surface.clientHeight / 2
})

const clampZoom = (scale) => clampNumber(scale, ZOOM_MIN, ZOOM_MAX)

const clampWheelDelta = (delta) => clampNumber(delta, -WHEEL_ZOOM_MAX_DELTA, WHEEL_ZOOM_MAX_DELTA)

const normalizedWheelDelta = (event) => {
  if (event.deltaMode === WHEEL_DELTA_LINE) {
    return event.deltaY * WHEEL_DELTA_LINE_PIXELS
  }

  if (event.deltaMode === WHEEL_DELTA_PAGE) {
    return event.deltaY * WHEEL_DELTA_PAGE_PIXELS
  }

  return event.deltaY
}

const shouldZoomFromWheel = (event) => event.ctrlKey || event.metaKey

const currentGraphScale = (graph) => {
  const zoom = graph.zoom()
  if (Number.isFinite(zoom)) {
    return zoom
  }

  return toNumber(graph.scale()?.sx, 1)
}

const currentTranslation = (graph) => {
  const translation = graph.translate()
  return {
    tx: toNumber(translation?.tx, 0),
    ty: toNumber(translation?.ty, 0)
  }
}

const currentTransform = (graph) => ({
  scale: currentGraphScale(graph),
  ...currentTranslation(graph)
})

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

const easeOutCubic = (progress) => 1 - ((1 - progress) ** 3)

const localPointAtViewportPoint = (graph, point) => {
  const { scale, tx, ty } = currentTransform(graph)
  return {
    x: (point.x - tx) / scale,
    y: (point.y - ty) / scale
  }
}

const translationForLocalPoint = (localPoint, viewportPoint, scale) => ({
  tx: viewportPoint.x - localPoint.x * scale,
  ty: viewportPoint.y - localPoint.y * scale
})

const nodeCenterPoint = (node) => {
  const bbox = node.getBBox()
  return {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2
  }
}

const nodeById = (graph, nodeId) =>
  graph.getNodes().find((node) => node.id === nodeId)

const pointerViewportPoint = (surface, event) => {
  const rect = surface.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

const syncTransformDataset = (surface, transform, mode) => {
  surface.dataset.flowchartScale = transform.scale.toFixed(3)
  surface.dataset.flowchartTranslateX = Math.round(transform.tx).toString()
  surface.dataset.flowchartTranslateY = Math.round(transform.ty).toString()
  surface.dataset.flowchartZoomMode = mode
}

export const createViewportController = (graph, surface, graphData, { onChange } = {}) => {
  let frameId = 0
  let manualZoom = false

  const mode = () => manualZoom ? ZOOM_MODE_MANUAL : ZOOM_MODE_AUTO

  const state = () => ({
    maxScale: ZOOM_MAX,
    minScale: ZOOM_MIN,
    mode: mode(),
    scale: currentGraphScale(graph)
  })

  const notify = () => {
    if (typeof onChange === "function") {
      onChange(state())
    }
  }

  const cancel = () => {
    if (frameId) {
      window.cancelAnimationFrame(frameId)
      frameId = 0
    }
    delete surface.dataset.flowchartAnimating
  }

  const apply = (transform) => {
    const nextTransform = {
      scale: clampZoom(transform.scale),
      tx: transform.tx,
      ty: transform.ty
    }
    graph.zoomTo(nextTransform.scale, { maxScale: ZOOM_MAX, minScale: ZOOM_MIN })
    graph.translate(nextTransform.tx, nextTransform.ty)
    syncTransformDataset(surface, nextTransform, mode())
    notify()
  }

  const animateTo = (targetTransform, { duration = ZOOM_ANIMATION_MS, immediate = false } = {}) => {
    const startTransform = currentTransform(graph)
    const endTransform = {
      scale: clampZoom(targetTransform.scale),
      tx: targetTransform.tx,
      ty: targetTransform.ty
    }
    cancel()

    if (immediate || prefersReducedMotion() || duration <= 0) {
      apply(endTransform)
      return
    }

    surface.dataset.flowchartAnimating = "true"
    const startedAt = window.performance.now()
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      const easedProgress = easeOutCubic(progress)
      apply({
        scale: startTransform.scale + ((endTransform.scale - startTransform.scale) * easedProgress),
        tx: startTransform.tx + ((endTransform.tx - startTransform.tx) * easedProgress),
        ty: startTransform.ty + ((endTransform.ty - startTransform.ty) * easedProgress)
      })

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step)
      } else {
        frameId = 0
        delete surface.dataset.flowchartAnimating
      }
    }

    frameId = window.requestAnimationFrame(step)
  }

  const zoomTo = (targetScale, {
    anchor = viewportCenter(surface),
    duration = ZOOM_ANIMATION_MS,
    immediate = false
  } = {}) => {
    const scale = clampZoom(targetScale)
    const localAnchor = localPointAtViewportPoint(graph, anchor)
    animateTo(
      {
        scale,
        ...translationForLocalPoint(localAnchor, anchor, scale)
      },
      { duration, immediate }
    )
  }

  const focusNode = (nodeId, {
    scale = null,
    duration = FOCUS_ANIMATION_MS,
    immediate = false
  } = {}) => {
    const node = nodeById(graph, nodeId)
    if (!node) {
      return false
    }

    const targetScale = clampZoom(scale ?? (manualZoom ? currentGraphScale(graph) : FOCUS_SCALE))
    const center = viewportCenter(surface)
    animateTo(
      {
        scale: targetScale,
        ...translationForLocalPoint(nodeCenterPoint(node), center, targetScale)
      },
      { duration, immediate }
    )
    return true
  }

  const positionStart = ({ preserveScale = false } = {}) => {
    cancel()
    if (!preserveScale) {
      manualZoom = false
    }
    graph.zoomTo(preserveScale ? currentGraphScale(graph) : preferredScale(graphData), {
      maxScale: ZOOM_MAX,
      minScale: ZOOM_MIN
    })
    graph.positionContent("top-left")
    graph.translateBy(FLOWCHART_CONTENT_PADDING, FLOWCHART_CONTENT_PADDING)
    syncTransformDataset(surface, currentTransform(graph), mode())
    notify()
  }

  return {
    cancel,
    focusNode,
    isManual() {
      return manualZoom
    },
    positionStart,
    resetAuto({ selectedNodeId = "" } = {}) {
      manualZoom = false
      if (selectedNodeId && focusNode(selectedNodeId)) {
        return
      }

      positionStart()
    },
    setZoom(targetScale, options = {}) {
      manualZoom = true
      zoomTo(targetScale, options)
    },
    state,
    stepZoom(direction, options = {}) {
      manualZoom = true
      zoomTo(currentGraphScale(graph) + (direction * ZOOM_CONTROL_STEP), options)
    },
    zoomFromWheel(event) {
      if (!shouldZoomFromWheel(event)) {
        return false
      }

      event.preventDefault()
      manualZoom = true
      const delta = clampWheelDelta(normalizedWheelDelta(event))
      const scaleFactor = Math.exp(-delta * WHEEL_ZOOM_SENSITIVITY)
      zoomTo(currentGraphScale(graph) * scaleFactor, {
        anchor: pointerViewportPoint(surface, event),
        immediate: true
      })
      return true
    },
    refocusSelected(nodeId) {
      focusNode(nodeId, {
        scale: currentGraphScale(graph),
        duration: RESIZE_FOCUS_ANIMATION_MS
      })
    }
  }
}
