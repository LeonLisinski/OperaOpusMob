/**
 * Neutralna paleta (bez zelenog tona u pozadinama/rubovima/tekstu) + SvamPlus
 * brand boja (#496C60) rezervirana isključivo za akcent: primarne gumbe, fokus
 * stateove, aktivne elemente i sitne naglaske. Ostatak UI-ja je namjerno
 * neutralan i smiren — v. docs/.vitepress/theme/custom.css za dijeljeni brand.
 *
 * Light je primarni i zadani vizualni smjer (v. theme/index.ts). Dark paleta
 * ostaje definirana kao tehnička osnova za budući eksplicitni toggle, ali nije
 * trenutni dizajnerski prioritet.
 */

export const colors = {
  light: {
    background: '#F7F8FA',
    surface: '#FFFFFF',
    surfaceMuted: '#F1F3F5',

    border: '#E4E7EC',
    borderStrong: '#D0D5DD',

    text: '#101828',
    textMuted: '#667085',
    textSubtle: '#98A2B3',

    primary: '#496C60',
    primaryPressed: '#3B594F',
    primarySoft: '#E8EEEC',
    onPrimary: '#FFFFFF',

    success: '#12B76A',
    successSoft: '#E7F8EF',
    warning: '#F79009',
    warningSoft: '#FEF3E2',
    danger: '#D92D20',
    dangerSoft: '#FBEAE9',
  },
  dark: {
    background: '#0B0E13',
    surface: '#151920',
    surfaceMuted: '#1D2229',

    border: '#262C35',
    borderStrong: '#333B46',

    text: '#F2F4F7',
    textMuted: '#98A2B3',
    textSubtle: '#667085',

    primary: '#6FA593',
    primaryPressed: '#84B4A3',
    primarySoft: '#1B2924',
    onPrimary: '#0B140F',

    success: '#32D583',
    successSoft: '#132A20',
    warning: '#FDB022',
    warningSoft: '#2B2109',
    danger: '#F97066',
    dangerSoft: '#2C1512',
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ThemeColors = (typeof colors)[ColorScheme];
