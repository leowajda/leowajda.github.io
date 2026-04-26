import { clamp } from "./eureka-flowchart-dom.js"

export const createFlowchartViewport = ({
  root,
  viewport,
  scaled,
  chartWidth,
  chartHeight,
  desktopScale,
  mobileScale,
  state
}) => {
  const getPreferredScale = () => (window.matchMedia("(max-width: 820px)").matches ? mobileScale : desktopScale)

  const getViewportMaxScrollLeft = () => Math.max(0, scaled.offsetWidth - viewport.clientWidth)
  const getViewportMaxScrollTop = () => Math.max(0, scaled.offsetHeight - viewport.clientHeight)

  const canPan = () => getViewportMaxScrollLeft() > 1 || getViewportMaxScrollTop() > 1

  const syncScale = () => {
    const preferredScale = getPreferredScale()
    const fitScale = viewport.clientWidth > 0 ? viewport.clientWidth / chartWidth : preferredScale

    state.scale = Math.min(preferredScale, fitScale)
    root.style.setProperty("--flowchart-scale", String(state.scale))
    scaled.style.width = `${chartWidth * state.scale}px`
    scaled.style.height = `${chartHeight * state.scale}px`
    root.classList.toggle("is-pannable", canPan())
  }

  const scrollViewportToChartPoint = (chartX, chartY, behavior = "smooth") => {
    if (!canPan()) {
      return
    }

    const left = clamp((chartX * state.scale) - (viewport.clientWidth / 2), 0, getViewportMaxScrollLeft())
    const top = clamp((chartY * state.scale) - (viewport.clientHeight / 2), 0, getViewportMaxScrollTop())
    viewport.scrollTo({
      left,
      top,
      behavior
    })
  }

  const scrollPageToElement = (element, behavior = "smooth") => {
    if (!(element instanceof Element)) {
      return
    }

    const rect = element.getBoundingClientRect()
    const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const targetTop = clamp(
      window.scrollY + rect.top - ((window.innerHeight - rect.height) / 2),
      0,
      maxScrollTop
    )

    window.scrollTo({
      top: targetTop,
      behavior
    })
  }

  const centerElement = (element, behavior = "smooth") => {
    if (!(element instanceof Element)) {
      return
    }

    if (!canPan()) {
      scrollPageToElement(element, behavior)
      return
    }

    scrollViewportToChartPoint(
      element.offsetLeft + (element.offsetWidth / 2),
      element.offsetTop + (element.offsetHeight / 2),
      behavior
    )
  }

  return {
    canPan,
    centerElement,
    syncScale
  }
}
