const toSentenceCase = (value) => {
  if (!value) {
    return ""
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

const accessibleLabel = (value) => (value || "").replaceAll("$", "")

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
  const question = document.createElement("span")
  const label = step.question || step.label || step.title

  button.type = "button"
  button.className = "flowchart-path__button"
  button.setAttribute("aria-label", accessibleLabel(label))
  button.addEventListener("click", () => {
    onSelectRouteNode?.(step.id)
  })

  question.className = "flowchart-path__question"
  question.textContent = label
  button.append(question)

  return button
}

const createChoiceButton = (choice, onSelectRouteNode) => {
  const button = document.createElement("button")
  const label = document.createElement("span")
  const choiceLabel = choice.question || choice.label || choice.title

  button.type = "button"
  button.className = "flowchart-path__choice"
  button.setAttribute("aria-label", `${toSentenceCase(choice.answer)}: ${accessibleLabel(choiceLabel)}`)
  button.addEventListener("click", () => {
    onSelectRouteNode?.(choice.id)
  })

  const answerElement = createRouteAnswer(choice.answer)
  if (answerElement) {
    answerElement.classList.add("flowchart-path__choice-answer")
    button.append(answerElement)
  }

  label.className = "flowchart-path__choice-label"
  label.textContent = choiceLabel
  button.append(label)

  return button
}

const createChoiceList = (choices, onSelectRouteNode) => {
  if (!Array.isArray(choices) || choices.length === 0) {
    return null
  }

  const group = document.createElement("div")
  const label = document.createElement("p")
  const list = document.createElement("ol")

  group.className = "flowchart-path__next"
  label.className = "flowchart-path__next-label"
  label.textContent = "Next"
  list.className = "flowchart-path__choices"
  list.setAttribute("aria-label", "Next decisions")

  choices.forEach((choice) => {
    const item = document.createElement("li")
    item.append(createChoiceButton(choice, onSelectRouteNode))
    list.append(item)
  })

  group.append(label, list)
  return group
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

  const entry = createRouteButton(step, onSelectRouteNode)

  const answerElement = createRouteAnswer(answer)
  if (answerElement) {
    answerElement.setAttribute("aria-hidden", "true")
    entry.append(answerElement)
  }

  block.append(entry)

  return block
}

export const createRoutePanel = (route, onSelectRouteNodeOrOptions, nextChoices = []) => {
  if (!Array.isArray(route) || route.length === 0) {
    return null
  }

  const options = typeof onSelectRouteNodeOrOptions === "function"
    ? { choices: nextChoices, onSelectRouteNode: onSelectRouteNodeOrOptions }
    : (onSelectRouteNodeOrOptions || {})
  const { choices = [], onSelectRouteNode } = options
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
  const choiceList = createChoiceList(choices, onSelectRouteNode)
  if (choiceList) {
    panel.append(choiceList)
  }

  return panel
}
