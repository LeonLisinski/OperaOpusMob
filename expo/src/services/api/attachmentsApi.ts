import { apiPost } from './client';

/**
 * Jedna datoteka pripremljena za upload — polja odgovaraju točno onome što Ionic šalje
 * (v. src/pages/dgl/tabs/TabPrivitci.jsx `result.files` iz @capawesome/capacitor-file-picker
 * `PickedFile`: name/mimeType/data(base64)/size). Backend oblik za `/saveatt` nije u ovom
 * repozitoriju (v. .cursor/rules/00-project-context.mdc — API servis nije ovdje), pa se
 * repliciraju točno polja koja postojeća Ionic aplikacija već uspješno šalje.
 */
export interface AttachmentUploadFile {
  name: string;
  mimeType: string;
  data: string;
  size?: number;
}

/**
 * POST /saveatt — ekvivalent src/utils/dataHelper.js saveAttachments. Nije /data SP poziv;
 * tijelo zahtjeva je `{ db, parameters: { dglid, files } }`, bez `queries` omotača.
 */
export async function uploadAttachmentsRequest(params: {
  apiBaseUrl: string;
  tenantDb: string;
  itemId: string | number;
  files: AttachmentUploadFile[];
}): Promise<unknown> {
  return apiPost<unknown>({
    url: `${params.apiBaseUrl}/saveatt`,
    body: {
      db: params.tenantDb,
      parameters: {
        dglid: params.itemId,
        files: params.files,
      },
    },
  });
}

export interface AttachmentDownloadResponse {
  FileName: string;
  Base64String: string;
}

function parseMaybeJson(raw: unknown): unknown {
  if (typeof raw !== 'string') {
    return raw;
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return raw;
  }
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      return raw;
    }
  }
  return raw;
}

function pickFileName(source: Record<string, unknown>, fallback?: string): string | null {
  const fileName = source.FileName ?? source.fileName ?? source.filename ?? source.naziv ?? source.Naziv;
  if (typeof fileName === 'string' && fileName.length > 0) {
    return fileName;
  }
  return fallback ?? null;
}

function pickBase64(source: Record<string, unknown>): string | null {
  const base64 =
    source.Base64String ??
    source.base64String ??
    source.base64 ??
    source.Base64 ??
    source.data ??
    source.sadrzaj;
  return typeof base64 === 'string' && base64.length > 0 ? base64 : null;
}

function readAttachmentPayload(raw: unknown, fallbackFileName?: string): AttachmentDownloadResponse {
  const parsed = parseMaybeJson(raw);

  if (typeof parsed === 'string' && parsed.length > 0 && !parsed.startsWith('{') && !parsed.startsWith('[')) {
    const fileName = fallbackFileName ?? 'privitak';
    return { FileName: fileName, Base64String: parsed.trim() };
  }

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const record = parsed as Record<string, unknown>;
    const nested =
      record.data && typeof record.data === 'object' && !Array.isArray(record.data)
        ? (record.data as Record<string, unknown>)
        : record.result && typeof record.result === 'object' && !Array.isArray(record.result)
          ? (record.result as Record<string, unknown>)
          : record.payload && typeof record.payload === 'object' && !Array.isArray(record.payload)
            ? (record.payload as Record<string, unknown>)
            : null;

    const source = nested ?? record;
    const fileName = pickFileName(source, fallbackFileName);
    const base64 = pickBase64(source);

    if (fileName && base64) {
      return { FileName: fileName, Base64String: base64 };
    }
  }

  const row = Array.isArray(parsed) ? parsed[0] : parsed;
  if (row && typeof row === 'object') {
    const record = row as Record<string, unknown>;
    const fileName = pickFileName(record, fallbackFileName);
    const base64 = pickBase64(record);

    if (fileName && base64) {
      return { FileName: fileName, Base64String: base64 };
    }
  }

  if (parsed === null || parsed === undefined) {
    throw new Error('Privitak nije pronađen na poslužitelju.');
  }

  if (__DEV__) {
    console.warn('[attachmentsApi] Neočekivan odgovor preuzimanja datoteke:', parsed);
  }

  throw new Error('Privitak nije pronađen na poslužitelju.');
}

/** ID privitka iz retka `getPrilozi` — ne miješati s `dglid` dokumenta. */
export function resolveAttachmentId(item: Record<string, unknown>): string | number {
  const candidates = [
    item.id,
    item.ID,
    item.Id,
    item.prilogid,
    item.prilogId,
    item.PrilogID,
    item.attid,
    item.AttId,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  throw new Error('Privitak nema identifikator.');
}

export function resolveAttachmentFileName(item: Record<string, unknown>): string {
  const fromRow = pickFileName(item);
  if (fromRow) {
    return fromRow;
  }
  const putanja = typeof item.putanja === 'string' ? item.putanja : '';
  const base = putanja.split(/[/\\]/).pop();
  return base && base.length > 0 ? base : 'privitak';
}

/**
 * POST /getatt — ekvivalent src/utils/dataHelper.js getAttachemnt. Odgovor koristi
 * PascalCase ključeve (`FileName`, `Base64String`) — potvrđeno iz Ionic izvora
 * (src/pages/dgl/tabs/TabPrivitci.jsx onItemClick), ne pretpostavka.
 */
export async function fetchAttachmentRequest(params: {
  apiBaseUrl: string;
  tenantDb: string;
  id: string | number;
  fileName?: string;
}): Promise<AttachmentDownloadResponse> {
  const raw = await apiPost<unknown>({
    url: `${params.apiBaseUrl}/getatt`,
    body: { db: params.tenantDb, id: params.id },
  });

  return readAttachmentPayload(raw, params.fileName);
}

/**
 * POST /base64frompath — ekvivalent src/utils/dataHelper.js getFile(). Ionic ga ne koristi
 * za dgl privitke, ali SP `getPrilozi` vraća `putanja` (UNC) pa je ovo fallback kad `/getatt`
 * vrati null (npr. test API nema pristup datoteci).
 */
export async function fetchFileFromPathRequest(params: {
  apiBaseUrl: string;
  path: string;
  fileName?: string;
}): Promise<AttachmentDownloadResponse> {
  const raw = await apiPost<unknown>({
    url: `${params.apiBaseUrl}/base64frompath`,
    body: { path: params.path },
  });

  return readAttachmentPayload(raw, params.fileName);
}
