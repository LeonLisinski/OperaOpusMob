import type { ObavijestRow, VozniRedRow } from './types';

function asString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Normalizira datum u `YYYY-MM-DD` (prihvaća i `yyyyMMdd`). */
function asIsoDate(value: unknown): string | null {
  const text = asString(value);
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }
  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  }
  return text;
}

/** Parsira `suvozaci` / `vozacijson` (string ili već array). */
function parseDriverJson(value: unknown): Array<{ naziv?: string; sifosobe?: string }> {
  if (value === null || value === undefined || value === '') return [];
  let parsed: unknown = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is { naziv?: string; sifosobe?: string } => !!item && typeof item === 'object');
}

function suvozaciNames(lower: Record<string, unknown>): string[] {
  const fromJson = parseDriverJson(lower.suvozaci)
    .map((d) => asString(d.naziv))
    .filter((name): name is string => !!name);

  if (fromJson.length > 0) return fromJson;

  const legacy = asString(lower.imedodatnogvozaca);
  return legacy ? [legacy] : [];
}

/** Normalizira jedan red iz `/data` odgovora (case-insensitive ključevi). */
export function normalizeVozniRedRow(raw: Record<string, unknown>): VozniRedRow | null {
  const lower: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    lower[key.toLowerCase()] = value;
  }

  const datumvoznje = asString(lower.datumvoznje);
  if (!datumvoznje) {
    return null;
  }

  return {
    disprasporedstavkaid: asNumber(lower.disprasporedstavkaid),
    datumvoznje,
    sifosobe: asString(lower.sifosobe),
    imevozaca: asString(lower.imevozaca),
    sifpred: asString(lower.sifpred),
    nazivlinije: asString(lower.nazivlinije),
    odrediste: asString(lower.odrediste),
    mjestopolaskanaziv: asString(lower.mjestopolaskanaziv),
    mjestoodredistanaziv: asString(lower.mjestoodredistanaziv),
    mjestoa_naziv: asString(lower.mjestoa_naziv),
    mjestob_naziv: asString(lower.mjestob_naziv),
    relacija: asString(lower.relacija),
    relacijaod: asString(lower.relacijaod),
    relacijado: asString(lower.relacijado),
    vrijemepolaska: asString(lower.vrijemepolaska),
    vrijemedolaska: asString(lower.vrijemedolaska),
    smjenatip: asString(lower.smjenatip),
    registracija: asString(lower.registracija),
    rednibrojvozaca: asNumber(lower.rednibrojvozaca),
    suvozaciImena: suvozaciNames(lower),
  };
}

export function normalizeVozniRedRows(rawRows: Record<string, unknown>[]): VozniRedRow[] {
  const rows: VozniRedRow[] = [];
  for (const raw of rawRows) {
    const row = normalizeVozniRedRow(raw);
    if (row) rows.push(row);
  }
  return rows;
}

export function normalizeObavijestRow(raw: Record<string, unknown>): ObavijestRow | null {
  const lower: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    lower[key.toLowerCase()] = value;
  }

  const datum = asIsoDate(lower.datum);
  const status = asString(lower.status);
  if (!datum || !status) {
    return null;
  }

  return {
    disprasporedobavijestid: asNumber(lower.disprasporedobavijestid),
    sifosobe: asString(lower.sifosobe),
    datum,
    status,
    komentar: asString(lower.komentar),
    poslanou: asString(lower.poslanou),
    imevozaca: asString(lower.imevozaca),
  };
}

export function normalizeObavijestRows(rawRows: Record<string, unknown>[]): ObavijestRow[] {
  const rows: ObavijestRow[] = [];
  for (const raw of rawRows) {
    const row = normalizeObavijestRow(raw);
    if (row) rows.push(row);
  }
  return rows;
}
