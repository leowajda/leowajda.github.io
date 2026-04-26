export const initializeBackButton = () => {
  const button = document.querySelector("[data-back-button]")
  if (!button) {
    return
  }

  let referrerUrl = null

  try {
    if (document.referrer) {
      const parsed = new URL(document.referrer)
      if (parsed.origin === window.location.origin) {
        referrerUrl = parsed
      }
    }
  } catch {
    referrerUrl = null
  }

  if (!referrerUrl) {
    button.hidden = true
    return
  }

  button.hidden = false
  button.setAttribute("aria-label", "Back to previous page")
  button.setAttribute("title", "Back to previous page")
  button.addEventListener("click", () => {
    window.history.back()
  })
}
