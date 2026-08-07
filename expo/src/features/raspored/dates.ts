import { parseIsoDateParts, toIsoDate, todayIso } from '@/features/documents/format';

import type { RasporedDaySection, VozniRedRow } from './types';

const DAY_NAMES_HR = [
  'nedjelja',
  'ponedjeljak',
  'utorak',
  'srijeda',
  'četvrtak',
  'petak',
  'subota',
];

/** Pola sata nakon predviđenog dolaska vožnja se vizualno tretira kao gotova. */
export const RIDE_DONE_GRACE_MS = 30 * 60 * 1000;

/** Aktualno: danas … danas+6 (UI limit 7 dana). Lokalni kalendarski dani — bez UTC pomaka. */
export function aktualnoRange(now = new Date()): { datumOd: string; datumDo: string } {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { datumOd: toIsoDate(start), datumDo: toIsoDate(end) };
}

/** Sutra: samo sutrašnji lokalni kalendarski dan. */
export function sutraRange(now = new Date()): { datumOd: string; datumDo: string } {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() + 1);
  const iso = toIsoDate(d);
  return { datumOd: iso, datumDo: iso };
}

/** Ponedjeljak (lokalno) tjedna u kojem je `date`. */
export function startOfWeekMonday(date: Date): Date {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = local.getDay(); // 0=ned … 6=sub
  const delta = day === 0 ? -6 : 1 - day;
  local.setDate(local.getDate() + delta);
  return local;
}

/**
 * Povijest: kalendarski tjedan pon–ned.
 * offset 0 = prošli tjedan (prije tekućeg ponedjeljka); max offset 11 (= 12 tjedana).
 */
export function historyWeekRange(weekOffset: number, now = new Date()): { datumOd: string; datumDo: string } {
  const safeOffset = Math.max(0, Math.min(11, weekOffset));
  const thisMonday = startOfWeekMonday(now);
  const monday = new Date(thisMonday);
  monday.setDate(thisMonday.getDate() - 7 * (safeOffset + 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { datumOd: toIsoDate(monday), datumDo: toIsoDate(sunday) };
}

/** @deprecated koristi historyWeekRange */
export function historyRange(weekOffset: number): { datumOd: string; datumDo: string } {
  return historyWeekRange(weekOffset);
}

/** @deprecated koristi aktualnoRange */
export function upcomingRange(): { datumOd: string; datumDo: string } {
  return aktualnoRange();
}

export function addDaysIso(iso: string, days: number): string {
  const date = parseIsoDateParts(iso) ?? new Date();
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function formatDayDisplay(iso: string): { weekday: string; date: string } {
  const date = parseIsoDateParts(iso);
  const weekday = date ? DAY_NAMES_HR[date.getDay()] : '';
  const display = date
    ? `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.`
    : iso;
  return { weekday, date: display };
}

export function dayLabel(iso: string, now = new Date()): { label: string; accent: RasporedDaySection['accent'] } {
  const today = toIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  const tomorrow = addDaysIso(today, 1);
  const { weekday, date: display } = formatDayDisplay(iso);

  if (iso === today) {
    return { label: `Danas · ${display}`, accent: 'today' };
  }
  if (iso === tomorrow) {
    // U listi Aktualno: „Sutra“ je već tab — ovdje samo dan + datum.
    return { label: `${weekday} · ${display}`, accent: 'tomorrow' };
  }
  return { label: `${weekday} · ${display}`, accent: 'none' };
}

export function listIsoDays(datumOd: string, datumDo: string): string[] {
  const days: string[] = [];
  let cursor = datumOd;
  while (cursor <= datumDo) {
    days.push(cursor);
    cursor = addDaysIso(cursor, 1);
  }
  return days;
}

export function groupRidesByDay(
  rows: VozniRedRow[],
  datumOd: string,
  datumDo: string,
  options: { includeEmptyDays: boolean },
  now = new Date(),
): RasporedDaySection[] {
  const byDay = new Map<string, VozniRedRow[]>();
  for (const row of rows) {
    const key = row.datumvoznje;
    if (!key) continue;
    const list = byDay.get(key) ?? [];
    list.push(row);
    byDay.set(key, list);
  }

  const days = listIsoDays(datumOd, datumDo);
  const sections: RasporedDaySection[] = [];
  for (const datum of days) {
    const rides = byDay.get(datum) ?? [];
    if (!options.includeEmptyDays && rides.length === 0) {
      continue;
    }
    const { label, accent } = dayLabel(datum, now);
    sections.push({ datum, label, accent, rides });
  }
  return sections;
}

export function formatHistoryWeekTitle(datumOd: string, datumDo: string): string {
  const a = parseIsoDateParts(datumOd);
  const b = parseIsoDateParts(datumDo);
  if (!a || !b) return `${datumOd} – ${datumDo}`;
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`;
  return `${fmt(a)} – ${fmt(b)}`;
}

export function routeLabel(row: VozniRedRow): string {
  const relacija = row.relacija?.trim();
  if (relacija) {
    return relacija.replace(/\s*-\s*/g, ' → ');
  }
  const from =
    row.relacijaod?.trim() ||
    row.mjestopolaskanaziv?.trim() ||
    row.mjestoa_naziv?.trim() ||
    null;
  const to =
    row.relacijado?.trim() ||
    row.mjestoodredistanaziv?.trim() ||
    row.mjestob_naziv?.trim() ||
    row.odrediste?.trim() ||
    null;
  if (from && to) {
    return `${from} → ${to}`;
  }
  const line = row.nazivlinije?.trim();
  if (line && to) {
    return `${line} · ${to}`;
  }
  return line || to || '—';
}

export function timeRangeLabel(row: VozniRedRow): string {
  const a = row.vrijemepolaska?.trim() || '—';
  const b = row.vrijemedolaska?.trim();
  return b ? `${a} → ${b}` : a;
}

/**
 * Lokalni Date iz ISO datuma + `HH:mm` (uređajna zona).
 * Ne koristi `Date.parse('…Z')` — izbjegava UTC pomak.
 */
export function parseRideDateTimeLocal(datumIso: string, timeHm: string | null | undefined): Date | null {
  const date = parseIsoDateParts(datumIso);
  if (!date) return null;
  const raw = (timeHm ?? '').trim();
  const match = /^(\d{1,2}):(\d{2})/.exec(raw);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours > 23 || minutes > 59) {
    return null;
  }
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/** Stabilan ključ vožnje za lokalni „gotovo“ status. */
export function rideStableKey(ride: VozniRedRow): string {
  if (ride.disprasporedstavkaid != null) {
    return `id:${ride.disprasporedstavkaid}`;
  }
  return [
    ride.datumvoznje,
    ride.vrijemepolaska ?? '',
    ride.vrijemedolaska ?? '',
    ride.sifpred ?? '',
    ride.registracija ?? '',
  ].join('|');
}

/**
 * Vožnja je vizualno gotova ako je ručno označena, ili ako je prošlo
 * ≥ 30 min nakon predviđenog dolaska (inače polaska) u lokalnoj zoni.
 * `manualUndoneKeys` poništava i auto i ručno gotovo.
 */
export function isRideVisuallyDone(
  ride: VozniRedRow,
  options: {
    now?: Date;
    manualDoneKeys?: ReadonlySet<string>;
    manualUndoneKeys?: ReadonlySet<string>;
  } = {},
): boolean {
  const now = options.now ?? new Date();
  const key = rideStableKey(ride);
  if (options.manualUndoneKeys?.has(key)) {
    return false;
  }
  if (options.manualDoneKeys?.has(key)) {
    return true;
  }
  const end =
    parseRideDateTimeLocal(ride.datumvoznje, ride.vrijemedolaska) ??
    parseRideDateTimeLocal(ride.datumvoznje, ride.vrijemepolaska);
  if (!end) {
    return false;
  }
  return now.getTime() >= end.getTime() + RIDE_DONE_GRACE_MS;
}

export { todayIso };
