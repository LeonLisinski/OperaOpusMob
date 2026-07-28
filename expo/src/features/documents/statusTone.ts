/**
 * SP-ovi vraćaju `indcolor` kao slobodnu CSS boju (naziv ili hex) — v. src/pages/dgl/List.jsx
 * koji je koristi izravno. Sirova boja iz baze ne poštuje kontrast ni paletu aplikacije, pa je
 * ovdje svodimo na semantički ton koji se dalje renderira kroz theme boje.
 */
import type { ThemeColors } from '@/theme';

export type StatusTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/** Boje tona iz aktivne teme: `solid` za akcente, `soft` za podloge, `ink` za tekst na `soft`. */
export function tonePalette(
  colors: ThemeColors,
  tone: StatusTone,
): { solid: string; soft: string; ink: string } {
  switch (tone) {
    case 'primary':
      return { solid: colors.primary, soft: colors.primarySurface, ink: colors.primary };
    case 'success':
      return { solid: colors.success, soft: colors.successSoft, ink: colors.success };
    case 'warning':
      return { solid: colors.warning, soft: colors.warningSoft, ink: colors.warning };
    case 'danger':
      return { solid: colors.danger, soft: colors.dangerSoft, ink: colors.danger };
    case 'info':
      return { solid: colors.info, soft: colors.infoSoft, ink: colors.info };
    default:
      return { solid: colors.borderStrong, soft: colors.surfaceMuted, ink: colors.textMuted };
  }
}

const NAMED_TONES: Record<string, StatusTone> = {
  green: 'success',
  lime: 'success',
  olive: 'success',
  teal: 'success',
  seagreen: 'success',
  limegreen: 'success',
  forestgreen: 'success',
  red: 'danger',
  crimson: 'danger',
  firebrick: 'danger',
  maroon: 'danger',
  darkred: 'danger',
  orange: 'warning',
  orangered: 'warning',
  gold: 'warning',
  yellow: 'warning',
  goldenrod: 'warning',
  blue: 'info',
  navy: 'info',
  royalblue: 'info',
  dodgerblue: 'info',
  steelblue: 'info',
  cyan: 'info',
  gray: 'neutral',
  grey: 'neutral',
  darkgray: 'neutral',
  darkgrey: 'neutral',
  lightgray: 'neutral',
  lightgrey: 'neutral',
  silver: 'neutral',
  white: 'neutral',
  black: 'neutral',
};

function parseHex(value: string): { r: number; g: number; b: number } | null {
  const hex = value.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
  if (full.length !== 6 || !/^[0-9a-f]{6}$/i.test(full)) {
    return null;
  }
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function toneFromRgb({ r, g, b }: { r: number; g: number; b: number }): StatusTone {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  // Niska saturacija = siva/bijela/crna, nema statusnog značenja.
  if (max - min < 28) {
    return 'neutral';
  }
  if (r >= g && r >= b) {
    // Topli spektar: čim zelena komponenta znatno poraste, radi se o žutoj/narančastoj.
    return g > r * 0.55 ? 'warning' : 'danger';
  }
  if (g >= r && g >= b) {
    return 'success';
  }
  return 'info';
}

export function statusToneFromColor(raw: unknown): StatusTone {
  if (typeof raw !== 'string') {
    return 'neutral';
  }
  const value = raw.trim().toLowerCase();
  if (value.length === 0) {
    return 'neutral';
  }
  const named = NAMED_TONES[value];
  if (named) {
    return named;
  }
  const rgb = parseHex(value);
  return rgb ? toneFromRgb(rgb) : 'primary';
}
