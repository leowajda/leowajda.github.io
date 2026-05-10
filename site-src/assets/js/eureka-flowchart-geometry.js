export const toNumber = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const clampNumber = (value, min, max) => Math.min(max, Math.max(min, value))
