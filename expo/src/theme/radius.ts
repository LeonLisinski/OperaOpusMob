/** Zaobljenja — umjereno zaobljeno, konzistentno kroz kartice, inpute i gumbe. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export type RadiusKey = keyof typeof radius;
