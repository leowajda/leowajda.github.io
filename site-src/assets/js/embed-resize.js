// Protocol shared with RemNote Iframe Plugin (and any compatible host).
const MESSAGE_SOURCE = "remnote-iframe-plugin"
const MESSAGE_TYPE = "resize"

const measureHeight = () => {
  const root = document.querySelector(".embed-root") || document.body
  const rect = root.getBoundingClientRect()
  const height = Math.ceil(
    Math.max(
      root.scrollHeight,
      document.documentElement.scrollHeight,
      rect.height
    )
  )
  return Math.max(height, 1)
}

export const notifyEmbedResize = () => {
  if (window.parent === window) {
    return
  }

  const height = measureHeight()
  window.parent.postMessage(
    {
      source: MESSAGE_SOURCE,
      type: MESSAGE_TYPE,
      height,
      url: window.location.href
    },
    "*"
  )
}

export const initializeEmbedResize = () => {
  notifyEmbedResize()

  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(() => {
      notifyEmbedResize()
    })
    observer.observe(document.documentElement)
    const root = document.querySelector(".embed-root")
    if (root) {
      observer.observe(root)
    }
  }

  window.addEventListener("load", notifyEmbedResize)
  if (document.fonts?.ready) {
    document.fonts.ready.then(notifyEmbedResize).catch(() => {})
  }

  document.addEventListener("click", () => {
    window.requestAnimationFrame(notifyEmbedResize)
  })
}
