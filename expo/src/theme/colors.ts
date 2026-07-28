/**
 * Brand-led paleta: SvamPlus zelena (#496C60) nosi navigaciju — headere, tab bar,
 * primarne akcije i akcente. Površine s podacima ostaju neutralne (bijela kartica
 * na sivoj pozadini) jer su to poslovni podaci koje korisnici čitaju cijeli dan.
 * Brand skala je usklađena s `docs/.vitepress/theme/custom.css` (--vp-c-brand-*).
 *
 * Light je primarni i zadani vizualni smjer (v. theme/index.ts); dark paleta prati
 * iste tokene kako bi svaki ekran radio u oba scheme-a bez posebnih grananja.
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

    /**
     * Podloga brandiranog chromea — header, tab bar, search band, auth hero.
     * Odvojena od `primary` jer u dark schemeu `primary` mora ostati svjetla
     * (tekst i ikone na tamnoj kartici), a chrome mora ostati taman.
     */
    brandChrome: '#496C60',
    brandChromePressed: '#3A564D',

    /** Tamnije brand nijanse — akcenti i pressed stanja na brand podlozi. */
    primaryStrong: '#3A564D',
    primaryDeep: '#2E453D',
    /** Soft brand zone — chipovi, hero sažetak, odabrani segmenti. */
    primarySurface: '#E7EDE9',
    primarySurfaceStrong: '#DBE6E0',
    primaryBorder: '#C4D6CD',

    /** Tekst i ikone na brand podlozi. */
    onBrand: '#FFFFFF',
    onBrandMuted: 'rgba(255,255,255,0.92)',
    onBrandSubtle: 'rgba(255,255,255,0.70)',
    /** Poluprozirna površina na brand podlozi (npr. gumb u headeru). */
    onBrandSurface: 'rgba(255,255,255,0.16)',

    success: '#12B76A',
    successSoft: '#E7F8EF',
    warning: '#F79009',
    warningSoft: '#FEF3E2',
    danger: '#D92D20',
    dangerSoft: '#FBEAE9',
    info: '#2E90FA',
    infoSoft: '#E8F2FE',

    /** Tinta na ispunjenoj statusnoj podlozi (swipe akcije, badgevi u punoj boji). */
    onSuccess: '#FFFFFF',
    onWarning: '#231502',
    onDanger: '#FFFFFF',
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

    brandChrome: '#1E2C26',
    brandChromePressed: '#16211C',

    primaryStrong: '#22332C',
    primaryDeep: '#1A2621',
    primarySurface: '#1C2523',
    primarySurfaceStrong: '#223029',
    primaryBorder: '#2D3D36',

    onBrand: '#F2F4F7',
    onBrandMuted: 'rgba(242,244,247,0.92)',
    onBrandSubtle: 'rgba(242,244,247,0.66)',
    onBrandSurface: 'rgba(242,244,247,0.12)',

    success: '#32D583',
    successSoft: '#132A20',
    warning: '#FDB022',
    warningSoft: '#2B2109',
    danger: '#F97066',
    dangerSoft: '#2C1512',
    info: '#53B1FD',
    infoSoft: '#101F30',

    onSuccess: '#07130D',
    onWarning: '#231502',
    onDanger: '#2A0B08',
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ThemeColors = (typeof colors)[ColorScheme];
