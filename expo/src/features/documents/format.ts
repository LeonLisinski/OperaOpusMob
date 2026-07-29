/**
 * Sigurno formatiranje vrijednosti polja prema layout `type`/`format` (v.
 * src/pages/dgl/tabs/Tab1.jsx renderGroupItemValue, List.jsx getItemValue).
 * Bez moment ovisnosti — format stringovi u layoutima koriste samo DD/MM/YYYY tokene.
 *
 * Prikaz korisniku: `dd.MM.yyyy` (DISPLAY_DATE_FORMAT). API/SP: ISO `YYYY-MM-DD`.
 */

const DATE_TOKEN_PATTERN = /YYYY|MM|DD/g;

/** Standardni prikaz datuma u aplikaciji — bez završne točke. */
export const DISPLAY_DATE_FORMAT = 'DD.MM.YYYY';

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Parsira ISO `YYYY-MM-DD` u lokalni Date (ponoć lokalne zone — bez UTC pomaka). */
export function parseIsoDateParts(iso: unknown): Date | null {
  if (typeof iso !== 'string' || iso.trim().length === 0) {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

/** ISO `YYYY-MM-DD` iz lokalnog Date dijela (bez UTC pomaka). */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Alias za čitljivost u DateField — isto kao toIsoDate. */
export function isoFromDateParts(date: Date): string {
  return toIsoDate(date);
}

/** Prikaz ISO datuma u `dd.MM.yyyy`; prazno → null. */
export function formatDisplayDate(iso: unknown): string | null {
  const date = parseIsoDateParts(iso);
  if (!date) {
    return null;
  }
  return formatDateValue(date, DISPLAY_DATE_FORMAT);
}

/** Formatira Date prema tokenima DD/MM/YYYY unutar proizvoljnog literal formata. */
export function formatDateValue(value: unknown, format?: string): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const date =
    value instanceof Date ? value : parseIsoDateParts(String(value)) ?? new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const tokens: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
  };

  const pattern = format && format.length > 0 ? format : DISPLAY_DATE_FORMAT;
  return pattern.replace(DATE_TOKEN_PATTERN, (token) => tokens[token]);
}

export function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toIsoDate(date);
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

/** Prazna/null/undefined vrijednost se ne prikazuje kao "undefined"/"null" nego kao null (pozivatelj prikazuje placeholder). */
export function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}
