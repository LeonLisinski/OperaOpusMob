/** App code za SB Raspored u OperaMobile.PinApp — ne JSON moduli. */
export const RASPORED_APP_CODE = 'raspored-mobile';

/**
 * Prepoznaje Raspored app.
 * Primarno `code === raspored-mobile`; fallback na url/title ako tenant menu ima grešku
 * (kao stari snapshot gdje je Code bio krivo `servis-mobile`).
 */
export function isRasporedApp(
  code?: string | null,
  url?: string | null,
  title?: string | null,
): boolean {
  if ((code ?? '').trim().toLowerCase() === RASPORED_APP_CODE) {
    return true;
  }
  const u = (url ?? '').trim().toLowerCase();
  if (u.includes('raspored')) {
    return true;
  }
  const t = (title ?? '').trim().toLowerCase();
  return t === 'raspored';
}
