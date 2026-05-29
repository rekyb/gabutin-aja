export function selectTheme(themeScores: { theme: string; points: number }[]): string {
  const weights = themeScores.map(ts => ({ theme: ts.theme, w: 1 / (ts.points + 1) }))
  const total = weights.reduce((sum, w) => sum + w.w, 0)
  let rand = Math.random() * total
  for (const { theme, w } of weights) {
    rand -= w
    if (rand <= 0) return theme
  }
  return weights[weights.length - 1].theme
}
