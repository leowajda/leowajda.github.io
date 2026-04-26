export const parseNumber = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value || "")
  return Number.isFinite(parsed) ? parsed : fallback
}

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const queryTemplate = (root, nodeId) =>
  root.querySelector(`template[data-flowchart-template="${CSS.escape(nodeId)}"]`)

export const queryNodeButton = (root, nodeId) =>
  root.querySelector(`[data-flowchart-node-id="${CSS.escape(nodeId)}"]`)
