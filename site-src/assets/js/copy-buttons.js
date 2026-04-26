const findCodeText = (button) => {
  const root = button.closest("[data-code-block]")
  if (!root) {
    return ""
  }

  const candidates = Array.from(root.querySelectorAll("[data-code-source] .highlight code, [data-code-source] code"))
  const visible = candidates.find((code) => !code.closest("[hidden]"))
  return visible?.innerText || candidates[0]?.innerText || ""
}

const setCopyButtonLabel = (button, label) => {
  button.setAttribute("aria-label", label)
}

const setCopyButtonState = (button, state, label) => {
  button.classList.remove("is-success", "is-error")

  if (state) {
    button.classList.add(`is-${state}`)
  }

  setCopyButtonLabel(button, label)
}

const resetCopyButton = (button) => {
  const defaultLabel = button.dataset.copyDefaultLabel || "Copy"
  setCopyButtonState(button, null, defaultLabel)
}

export const initializeCopyButtons = () => {
  for (const button of document.querySelectorAll("[data-code-copy-button]")) {
    resetCopyButton(button)
    button.addEventListener("click", () => {
      const codeText = findCodeText(button)
      if (!codeText || !navigator.clipboard) {
        setCopyButtonState(button, "error", "Copy failed")
        window.setTimeout(() => resetCopyButton(button), 1200)
        return
      }

      void navigator.clipboard.writeText(codeText)
        .then(() => {
          setCopyButtonState(button, "success", "Copied")
          window.setTimeout(() => resetCopyButton(button), 1200)
        })
        .catch(() => {
          setCopyButtonState(button, "error", "Copy failed")
          window.setTimeout(() => resetCopyButton(button), 1200)
        })
    })
  }
}
