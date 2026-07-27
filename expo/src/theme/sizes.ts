/** Touch-friendly visine kontrola (gumbi, inputi) — konzistentne kroz sve forme. */
export const controlHeight = {
  sm: 40,
  md: 48,
  lg: 52,
} as const;

export type ControlHeightKey = keyof typeof controlHeight;
