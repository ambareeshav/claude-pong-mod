// Which score counts as a new best. Pong's best is its widest winning margin, so higher wins;
// a score of zero or less never counts: a match you lost posts a margin of zero or less and
// should never overwrite a real win.
export function isBetter(score: number, prev: number | undefined, lowerIsBetter = false): boolean {
  if (!Number.isFinite(score) || score <= 0) return false
  if (prev === undefined || prev <= 0) return true
  return lowerIsBetter ? score < prev : score > prev
}
