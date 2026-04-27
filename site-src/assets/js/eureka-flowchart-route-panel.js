const toSentenceCase = (value) => {
  if (!value) {
    return ""
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

const createRouteAnswer = (answerText) => {
  if (!answerText) {
    return null
  }

  const answer = document.createElement("span")
  const answerSlug = answerText.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
  answer.className = "flowchart-path__answer"
  if (answerSlug) {
    answer.classList.add(`flowchart-path__answer--${answerSlug}`)
  }
  answer.textContent = toSentenceCase(answerText)

  return answer
}

const createRouteButton = (step, onSelectRouteNode) => {
  const button = document.createElement("button")
  button.type = "button"
  button.className = "flowchart-path__button"
  button.textContent = step.question || step.label || step.title
  button.addEventListener("click", () => {
    onSelectRouteNode?.(step.id)
  })
  return button
}

const createRouteStep = ({ step, answer, current = false, onSelectRouteNode }) => {
  const block = document.createElement("li")
  block.className = "flowchart-path__step"

  if (current) {
    block.classList.add("is-current")
  }
  if (step.kind === "decision" && !answer) {
    block.classList.add("flowchart-path__step--pending")
  }

  const main = document.createElement("div")
  main.className = "flowchart-path__main"
  main.append(createRouteButton(step, onSelectRouteNode))

  const answerElement = createRouteAnswer(answer)
  if (answerElement) {
    main.append(answerElement)
  }

  block.append(main)
  return block
}

export const createRoutePanel = (route, onSelectRouteNode) => {
  if (!Array.isArray(route) || route.length === 0) {
    return null
  }

  const panel = document.createElement("section")
  panel.className = "flowchart-inspector__panel flowchart-path"

  const finalStep = route[route.length - 1]
  const traversedQuestions = route.slice(0, -1).map((step, index) => ({
    step,
    answer: route[index + 1]?.answer || ""
  })).filter(({ step }) => step.kind === "decision")

  const list = document.createElement("ol")
  list.className = "flowchart-path__sequence"

  traversedQuestions.forEach(({ step, answer }) => {
    list.append(createRouteStep({
      step,
      answer,
      onSelectRouteNode
    }))
  })

  list.append(createRouteStep({
    step: finalStep,
    current: true,
    onSelectRouteNode
  }))

  if (list.children.length === 0) {
    return null
  }

  panel.append(list)

  return panel
}
