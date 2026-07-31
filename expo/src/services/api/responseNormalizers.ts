import type { AppUnlockRawEntry } from './authApi';

/**
 * Normalizira odgovor spPinAppAzur prema stvarnom API ponašanju (BaseSqlRepository.cs +
 * TableHelper.RemoveDataTableColums): jedan result set bez singlerow vraća se kao
 * JSON niz redova na root razini. Defenzivno prihvaća i `{ table1: [...] }` oblik
 * (PopulateJsonData) ako backend ikad vrati više tablica.
 */
export function normalizeAppUnlockResponse(raw: unknown): AppUnlockRawEntry[] {
  const rows = extractUnlockRows(raw);
  return rows.filter((item): item is AppUnlockRawEntry => !!item && typeof item.code === 'string');
}

function extractUnlockRows(raw: unknown): AppUnlockRawEntry[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeUnlockRow).filter((row): row is AppUnlockRawEntry => row !== null);
  }

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;

    // spPinAppAzur (i neki /data odgovori) vraćaju { value: [...], Count: n } — potvrđeno
    // na testapi 2026-07-27; stari normalizer očekivao goli niz na root razini.
    const value = record.value;
    if (Array.isArray(value)) {
      return value.map(normalizeUnlockRow).filter((row): row is AppUnlockRawEntry => row !== null);
    }

    // Jedan red bez singlerow ponekad stigne kao objekt { code, db }, ne kao niz — tada
    // stari normalizer vraća [] i unlock izgleda uspješan (HTTP 200) ali app ostaje locked.
    const singleRow = normalizeUnlockRow(record);
    if (singleRow) {
      return [singleRow];
    }

    const table1 = record.table1;
    if (Array.isArray(table1)) {
      return table1.map(normalizeUnlockRow).filter((row): row is AppUnlockRawEntry => row !== null);
    }

    const table2 = record.table2;
    if (Array.isArray(table2)) {
      return table2.map(normalizeUnlockRow).filter((row): row is AppUnlockRawEntry => row !== null);
    }
    if (table2 && typeof table2 === 'object') {
      const row = normalizeUnlockRow(table2);
      return row ? [row] : [];
    }
  }

  return [];
}

/** API lowercasira stupce (TableHelper.DataTableToLower / ConvertDtToJson) — prihvati i PascalCase fallback. */
function normalizeUnlockRow(row: unknown): AppUnlockRawEntry | null {
  if (!row || typeof row !== 'object') {
    return null;
  }
  const record = row as Record<string, unknown>;
  const code = record.code ?? record.Code;
  const db = record.db ?? record.Db;
  if (typeof code !== 'string') {
    return null;
  }
  return { code, db: typeof db === 'string' ? db : String(db ?? '') };
}

/** Vraća tenant bazu iz connection objekta — fallback na core.db (Ionic getData koristi connection.database). */
export function extractTenantDatabase(connection: Record<string, unknown> | null | undefined, coreDb: string): string {
  const database = connection?.database ?? connection?.Database ?? connection?.db ?? connection?.Db;
  if (typeof database === 'string' && database.trim().length > 0) {
    return database.trim();
  }
  return coreDb;
}

/**
 * Normalizira spMob_Menu_Query odgovor — table1/table2 mogu biti niz, { value: [...] }
 * ili pojedinačni objekt kad ima samo jedan red.
 */
export function normalizeMenuResponse(raw: unknown): { table1: Record<string, unknown>[]; table2: Record<string, unknown>[] } {
  if (!raw || typeof raw !== 'object') {
    return { table1: [], table2: [] };
  }
  const record = raw as Record<string, unknown>;
  return {
    table1: extractDataRows(record.table1),
    table2: extractDataRows(record.table2),
  };
}

function extractDataRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object');
  }
  if (!raw || typeof raw !== 'object') {
    return [];
  }
  const record = raw as Record<string, unknown>;
  if (Array.isArray(record.value)) {
    return record.value.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object');
  }
  if (record.code || record.appid || record.sifdv || record.title) {
    return [record];
  }
  return [];
}

/** Jedan red iz SP odgovora (filterdefaults) — defenzivno prihvaća niz ili objekt. */
export function normalizeSingleRow(raw: unknown): Record<string, unknown> | null {
  if (Array.isArray(raw)) {
    const first = raw[0];
    return first && typeof first === 'object' ? (first as Record<string, unknown>) : null;
  }
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    if (Array.isArray(record.value)) {
      const first = record.value[0];
      return first && typeof first === 'object' ? (first as Record<string, unknown>) : null;
    }
    if (Array.isArray(record.table1)) {
      const first = record.table1[0];
      return first && typeof first === 'object' ? (first as Record<string, unknown>) : null;
    }
    return record;
  }
  return null;
}

/** Postavke modula (core.settings) — searchfields u table1[0] ili root objektu. */
export function normalizeModuleSettings(raw: unknown): Record<string, unknown> {
  const row = normalizeSingleRow(raw);
  if (row) {
    return row;
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const record = raw as Record<string, unknown>;
    const table1 = record.table1;
    if (Array.isArray(table1) && table1[0] && typeof table1[0] === 'object') {
      return table1[0] as Record<string, unknown>;
    }
  }
  return {};
}

/**
 * Normalizira login `user` polje: backend (LoginController.cs) vraća DataTable koji se
 * serijalizira kao JSON niz redova — isto što Ionic očekuje kao json.user[0].
 */
export function normalizeLoginUser(raw: unknown): Record<string, unknown> | null {
  if (Array.isArray(raw) && raw[0] && typeof raw[0] === 'object') {
    return raw[0] as Record<string, unknown>;
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return null;
}

/** Vraća korime iz login reda — SQL alias je lowercase `korime` (Login.cs GetLoginData). */
export function extractKorime(userRow: Record<string, unknown>): string | null {
  const korime = userRow.korime ?? userRow.KorIme ?? userRow.Korime;
  return typeof korime === 'string' && korime.length > 0 ? korime : null;
}

/**
 * Normalizira odgovor generičkog upita liste dokumenata (dgl/gen `getList`):
 * upit bez `tablename`/`singlerow` vraća goli JSON niz na root razini
 * (TableHelper.RemoveDataTableColums). Defenzivno prihvaća i `{ table1: [...] }`
 * ako backend ikad vrati imenovanu tablicu.
 */
export function normalizeDocumentList(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object');
  }
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    const table1 = record.table1;
    if (Array.isArray(table1)) {
      return table1.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object');
    }
    if (table1 && typeof table1 === 'object' && Array.isArray((table1 as { value?: unknown }).value)) {
      return ((table1 as { value: unknown[] }).value).filter(
        (row): row is Record<string, unknown> => !!row && typeof row === 'object',
      );
    }
    if (Array.isArray(record.value)) {
      return record.value.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object');
    }
    // Jedan redak (npr. createDoc) — objekt s poslovnim ključevima, ne envelope.
    if (
      record.dglid !== undefined ||
      record.DglId !== undefined ||
      record.DGLID !== undefined ||
      record.brojdokumenta !== undefined ||
      record.id !== undefined
    ) {
      return [record];
    }
  }
  return [];
}

/** Čita polje iz SP retka bez obzira na casing (API ponekad vrati DglId / dglid). */
export function readRowField(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) {
      return row[key];
    }
  }
  const lowerMap = new Map(Object.keys(row).map((k) => [k.toLowerCase(), k]));
  for (const key of keys) {
    const actual = lowerMap.get(key.toLowerCase());
    if (actual !== undefined && row[actual] !== undefined && row[actual] !== null) {
      return row[actual];
    }
  }
  return undefined;
}
