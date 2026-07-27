/**
 * Sigurno formatiranje vrijednosti polja prema layout `type`/`format` (v.
 * src/pages/dgl/tabs/Tab1.jsx renderGroupItemValue, List.jsx getItemValue).
 * Bez moment ovisnosti — format stringovi u layoutima koriste samo DD/MM/YYYY tokene.
 */

const DATE_TOKEN_PATTERN = /YYYY|MM|DD/g;

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Formatira Date prema tokenima DD/MM/YYYY unutar proizvoljnog literal formata (npr. "DD.MM.YYYY."). */
export function formatDateValue(value: unknown, format?: string): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const tokens: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
  };

  const pattern = format && format.length > 0 ? format : 'DD.MM.YYYY.';
  return pattern.replace(DATE_TOKEN_PATTERN, (token) => tokens[token]);
}

/** ISO datum (YYYY-MM-DD) za SP parametre — bez moment ovisnosti. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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
