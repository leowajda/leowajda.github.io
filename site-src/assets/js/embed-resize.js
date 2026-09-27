const MESSAGE_SOURCE = "remnote-iframe-plugin"
const MESSAGE_TYPE = "resize"

const measureHeight = () => {
  const root = document.querySelector(".embed-root") || document.body
  return Math.max(Math.ceil(root.scrollHeight), Math.ceil(root.getBoundingClientRect().height), 1)
}

export const notifyEmbedResize = () => {
  if (window.parent === window) {
    return
  }
  window.parent.postMessage(
    {
      source: MESSAGE_SOURCE,
      type: MESSAGE_TYPE,
      height: measureHeight()
    },
    "*"
  )
}

export const initializeEmbedResize = () => {
  notifyEmbedResize()
  const root = document.querySelector(".embed-root")
  if (typeof ResizeObserver === "function" && root) {
    const observer = new ResizeObserver(() => {
      notifyEmbedResize()
    })
    observer.observe(root)
  }
  window.addEventListener("load", notifyEmbedResize)
  if (document.fonts?.ready) {
    document.fonts.ready.then(notifyEmbedResize).catch(() => {})
  }
}
