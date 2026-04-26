const MAX_SUMMARY_BLOCKS = 3
const MAX_SUMMARY_PARAGRAPHS = 2
const MAX_SUMMARY_LIST_ITEMS = 2
const MAX_SUMMARY_NESTED_ITEMS = 2

const trimListClone = (list, maxItems = MAX_SUMMARY_LIST_ITEMS) => {
  Array.from(list.children).slice(maxItems).forEach((item) => item.remove())

  list.querySelectorAll("ul, ol").forEach((nestedList) => {
    Array.from(nestedList.children).slice(MAX_SUMMARY_NESTED_ITEMS).forEach((item) => item.remove())
  })

  return list
}

const createSummaryLabel = (text) => {
  const label = document.createElement("p")
  label.className = "flowchart-summary__label"
  label.textContent = text
  return label
}

export const buildNoteSummary = (prose) => {
  if (!(prose instanceof Element)) {
    return null
  }

  const summary = document.createElement("div")
  const children = Array.from(prose.children)
  let summaryBlocks = 0
  let paragraphCount = 0
  let listCount = 0

  for (let index = 0; index < children.length; index += 1) {
    if (summaryBlocks >= MAX_SUMMARY_BLOCKS) {
      break
    }

    const child = children[index]
    const tagName = child.tagName.toLowerCase()

    if ((tagName === "h2" || tagName === "h3" || tagName === "h4") && summaryBlocks > 0) {
      break
    }

    if (tagName === "p") {
      if (paragraphCount >= MAX_SUMMARY_PARAGRAPHS) {
        continue
      }

      const nextStructuralChild = children.slice(index + 1).find((nextChild) => {
        const nextTagName = nextChild.tagName.toLowerCase()
        return nextTagName === "p" || nextTagName === "ul" || nextTagName === "ol" ||
          nextTagName === "h2" || nextTagName === "h3" || nextTagName === "h4"
      })

      if (paragraphCount > 0 && nextStructuralChild) {
        const nextTagName = nextStructuralChild.tagName.toLowerCase()
        if (nextTagName === "ul" || nextTagName === "ol") {
          continue
        }
      }

      summary.append(child.cloneNode(true))
      paragraphCount += 1
      summaryBlocks += 1
      continue
    }

    if (tagName === "ul" || tagName === "ol") {
      if (listCount >= 2) {
        continue
      }

      const listClone = trimListClone(child.cloneNode(true))
      if (listClone.children.length > 0) {
        if (listCount === 0) {
          summary.append(createSummaryLabel("Key Signals"))
        }
        summary.append(listClone)
        listCount += 1
        summaryBlocks += 1
      }
    }
  }

  if (summary.children.length === 0 && prose.firstElementChild) {
    summary.append(prose.firstElementChild.cloneNode(true))
  }

  return summary.children.length > 0 ? summary : null
}
