import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ModuleMenuEntry } from '@/features/core/types';
import { fetchAttachmentRequest, fetchFileFromPathRequest, resolveAttachmentFileName, resolveAttachmentId, uploadAttachmentsRequest, type AttachmentUploadFile } from '@/services/api/attachmentsApi';
import { fetchDocumentListRequest } from '@/services/api/documentsApi';
import { fetchModuleLayout } from '@/services/api/layoutsApi';
import { generateReportRequest } from '@/services/api/reportsApi';
import {
  extractTenantDatabase,
  normalizeDocumentList,
  normalizeMenuResponse,
  normalizeModuleSettings,
  normalizeSingleRow,
  readRowField,
} from '@/services/api/responseNormalizers';
import { saveAndOpenFile } from '@/services/files/fileViewer';
import type { RootState } from '@/store';
import { toUserMessage } from '@/types/api';

import {
  applyCachedFilterPreferences,
  buildListRequestParams,
  cloneFilter,
  createDefaultFilter,
  filterListBySearch,
  mergeStatusesWithDefaults,
  moduleFilterCacheKey,
  parseSearchFields,
} from './filterUtils';
import { normalizeModuleLayout } from './layoutContract';
import { overlayMissingLayoutContent } from './layoutContentPatches';
import { overlayMissingLayoutQueries } from './layoutQueryPatches';
import { layoutHasDstActions } from './dstLineHelpers';
import { resolveModuleRoute, buildDglModuleRoute } from './moduleRouting';
import { applyServisDnizLayoutFallback } from './servisDnizFallback';
import { applyServisRnLayoutFallback } from './servisRnFallback';
import type { DocumentFilter, DstLineKind, EditControlValues, EditFieldDef, ModuleLayout, ModuleRoute, QueryDef, StatusFilterItem } from './types';

interface RequestStatus {
  loading: boolean;
  error: string | null;
}

interface DocumentsState {
  route: ModuleRoute | null;
  layout: ModuleLayout | null;
  layoutStatus: RequestStatus;
  list: Record<string, unknown>[];
  originalList: Record<string, unknown>[];
  listStatus: RequestStatus;
  selectedItem: Record<string, unknown> | null;
  filter: DocumentFilter;
  filterBaseline: DocumentFilter;
  filterTemp: DocumentFilter | null;
  /** Aktivni filter po modulu — pamti se pri prelasku Upiti↔RN i povratku u isti modul. */
  filterCache: Record<string, DocumentFilter>;
  searchQuery: string;
  searchFields: string[];
  settings: Record<string, unknown>;
  /** Prikazane vrijednosti forme (selectFieldKey/selectFieldText) — ekvivalent Ionic docs.dataEdit. */
  editValues: EditControlValues | null;
  /** Vrijednosti koje se šalju SP-u pri spremanju (azurFieldKey) — ekvivalent Ionic dataNew. */
  editFormData: EditControlValues | null;
  saveStatus: RequestStatus;
  /** Stavke dokumenta (dst) — ekvivalent Ionic docs.datadet nakon getListItem. */
  dstLines: Record<string, unknown>[];
  dstLinesStatus: RequestStatus;
  dstLinesForItemId: string | number | null;
  /** Kontekst forme stavke (koja se sprema kroz zajednički editValues/editFormData) — ekvivalent Ionic dstDataEdit + dstTip + parentId. */
  dstEditContext: DstEditContext | null;
  /** Privitci dokumenta — ekvivalent Ionic docs.privitci (v. dgl/store getPrivitci). */
  attachments: Record<string, unknown>[];
  attachmentsStatus: RequestStatus;
  attachmentsForItemId: string | number | null;
  attachmentUploadStatus: RequestStatus;
  /** Id privitka koji se trenutno preuzima/otvara — za prikaz stanja na retku. */
  attachmentOpeningId: string | number | null;
  attachmentOpenError: string | null;
  /** Stanje spremanja potpisa + generiranja/slanja REPX izvještaja (v. dgl Tab4.jsx). */
  signatureStatus: RequestStatus;
  /** Naziv zadnje spremljene/poslane datoteke — ekvivalent Ionic poruke "Dokument '...' je pohranjen." */
  signatureSavedFileName: string | null;
}

interface DstEditContext {
  dstId: string | number | null;
  parentId: string | number | null;
  kind: DstLineKind;
}

const initialState: DocumentsState = {
  route: null,
  layout: null,
  layoutStatus: { loading: false, error: null },
  list: [],
  originalList: [],
  listStatus: { loading: false, error: null },
  selectedItem: null,
  filter: createDefaultFilter(),
  filterBaseline: createDefaultFilter(),
  filterTemp: null,
  filterCache: {},
  searchQuery: '',
  searchFields: [],
  settings: {},
  editValues: null,
  editFormData: null,
  saveStatus: { loading: false, error: null },
  dstLines: [],
  dstLinesStatus: { loading: false, error: null },
  dstLinesForItemId: null,
  dstEditContext: null,
  attachments: [],
  attachmentsStatus: { loading: false, error: null },
  attachmentsForItemId: null,
  attachmentUploadStatus: { loading: false, error: null },
  attachmentOpeningId: null,
  attachmentOpenError: null,
  signatureStatus: { loading: false, error: null },
  signatureSavedFileName: null,
};

function getTenantDb(state: RootState): string {
  return extractTenantDatabase(
    state.auth.connection as Record<string, unknown> | undefined,
    state.auth.core?.db ?? '',
  );
}

/** Ionic `/getatt` i `/saveatt` šalju `auth.db` iz core PIN-a, ne `connection.database` (v. dataHelper.js). */
function getAttachmentDb(state: RootState): string {
  return state.auth.core?.db ?? getTenantDb(state);
}

async function runSpQuery(
  apiBaseUrl: string,
  tenantDb: string,
  query: QueryDef,
  params: Record<string, unknown>,
): Promise<unknown> {
  return fetchDocumentListRequest({
    apiBaseUrl,
    tenantDb,
    sp: query.sp,
    params: { ...query.params, ...params },
  });
}

/** /doclayouts + postojeći patch-evi + servis RN fallback kad meni dolazi s /servis/radninalozi. */
function mergeFetchedModuleLayout(
  rawLayout: Record<string, unknown>,
  route: ModuleRoute,
  layoutPrefix: string | null,
): Record<string, unknown> {
  const folder = route.folder.replace(/\\/g, '/');
  const layoutModuleKey = route.kind === 'dgl' ? route.sifdv : folder;
  let merged = overlayMissingLayoutContent(
    overlayMissingLayoutQueries(rawLayout, layoutPrefix, folder, layoutModuleKey),
    layoutPrefix,
    folder,
    layoutModuleKey,
  );
  if (route.layoutSource === 'servis-rn') {
    merged = applyServisRnLayoutFallback(merged);
  } else if (route.layoutSource === 'servis-dniz') {
    merged = applyServisDnizLayoutFallback(merged);
  }
  return merged;
}

/**
 * spMob_UpdateDstRow pretvara dstdatum2temp (HHmm) u datetime:
 * `'1900-01-01 ' + HH + ':' + mm`. Unos "2" → "1900-01-01 2:" → CAST fail → 3930.
 */
function normalizeHhmmHours(raw: unknown): string | null {
  if (raw === null || raw === undefined) {
    return null;
  }
  const text = String(raw).trim().replace(',', '.');
  if (!text) {
    return null;
  }
  const colon = /^(\d{1,2}):(\d{1,2})$/.exec(text);
  if (colon) {
    const hh = Math.min(23, Number(colon[1]));
    const mm = Math.min(59, Number(colon[2]));
    return `${String(hh).padStart(2, '0')}${String(mm).padStart(2, '0')}`;
  }
  const digits = text.replace(/\D/g, '');
  if (!digits) {
    return null;
  }
  if (digits.length <= 2) {
    const hh = Math.min(23, Number(digits));
    return `${String(hh).padStart(2, '0')}00`;
  }
  if (digits.length === 3) {
    return `0${digits}`;
  }
  return digits.slice(0, 4);
}

/** Priprema jsonUpdatedValues: HHmm normalizacija, bez praznih stringova. */
function sanitizeDstJsonPayload(formData: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(formData)) {
    if (value === null || value === undefined) {
      continue;
    }
    if (typeof value === 'string' && value.trim() === '') {
      continue;
    }
    if (key.toLowerCase() === 'dstdatum2temp') {
      const hhmm = normalizeHhmmHours(value);
      if (hhmm) {
        out[key] = hhmm;
      }
      continue;
    }
    out[key] = value;
  }
  return out;
}

/**
 * CreateDoc (zjukic) SELECT vraća samo DGLID/BrojDokumenta; SifDV je na DGL retku.
 * spMob_DGL_Query nema action getSifDv (samo 'rn') — Ionic getSifDvById je mrtav kod.
 * ZJUKIC lista vraća SifDV kao "Vrsta radnog naloga".
 */
function readSifdvFromDglRow(row: Record<string, unknown> | null): string | null {
  if (!row) {
    return null;
  }
  const sifdv = readRowField(row, 'sifdv', 'vrsta radnog naloga');
  return typeof sifdv === 'string' && sifdv.trim().length > 0 ? sifdv.trim() : null;
}

async function resolveSifdvForCreatedRn(
  apiBaseUrl: string,
  tenantDb: string,
  dglid: string | number,
  korime: string,
): Promise<string | null> {
  const lookups: { sp: string; params: Record<string, unknown> }[] = [
    { sp: 'spMob_ZJUKIC_DGL_Query', params: { action: 'get', dglid, korime } },
    { sp: 'spMob_DGL_RadniNalozi_Query', params: { action: 'get', dglid, korime } },
  ];

  for (const lookup of lookups) {
    try {
      const raw = await runSpQuery(apiBaseUrl, tenantDb, { sp: lookup.sp }, lookup.params);
      const row = normalizeDocumentList(raw)[0] ?? normalizeSingleRow(raw);
      const sifdv = readSifdvFromDglRow(row);
      if (sifdv) {
        return sifdv;
      }
    } catch {
      // nastavi na sljedeći SP
    }
  }

  return null;
}

function mapStatusRows(raw: unknown): StatusFilterItem[] {
  const rows = normalizeMenuResponse({ table1: raw }).table1;
  return rows.map((row) => ({
    id: (row.id ?? row.Id ?? '') as string | number,
    name: String(row.name ?? row.Name ?? ''),
    indcolor: typeof row.indcolor === 'string' ? row.indcolor : typeof row.Indcolor === 'string' ? row.Indcolor : null,
    checked: false,
  }));
}

function applySearchToState(state: DocumentsState) {
  state.list = filterListBySearch(state.originalList, state.searchQuery, state.searchFields);
}

async function fetchListForModule(
  route: ModuleRoute,
  layout: ModuleLayout,
  filter: DocumentFilter,
  apiBaseUrl: string,
  tenantDb: string,
  korime: string,
  sifosobe?: string | number,
): Promise<Record<string, unknown>[]> {
  const params = buildListRequestParams(
    filter,
    korime,
    layout.listQuery.params,
    route.kind === 'dgl' ? route.sifdv : undefined,
  );
  if (sifosobe !== undefined) {
    params.sifosobe = sifosobe;
  }
  const raw = await runSpQuery(apiBaseUrl, tenantDb, layout.listQuery, params);
  return normalizeDocumentList(raw);
}

async function bootstrapFilters(
  layout: ModuleLayout,
  route: ModuleRoute,
  apiBaseUrl: string,
  tenantDb: string,
  korime: string,
): Promise<DocumentFilter> {
  const filter = createDefaultFilter();
  let defaultsRow: Record<string, unknown> | null = null;

  if (layout.filterDefaultsQuery) {
    const defaultsRaw = await runSpQuery(apiBaseUrl, tenantDb, layout.filterDefaultsQuery, {
      korime,
      ...(route.kind === 'dgl' && route.sifdv ? { sifdv: route.sifdv } : {}),
    });
    defaultsRow = normalizeSingleRow(defaultsRaw);
    if (defaultsRow?.datumod) {
      filter.datumod = String(defaultsRow.datumod).slice(0, 10);
    }
    if (defaultsRow?.datumdo) {
      filter.datumdo = String(defaultsRow.datumdo).slice(0, 10);
    }
  }

  if (layout.statusiQuery) {
    const statusesRaw = await runSpQuery(apiBaseUrl, tenantDb, layout.statusiQuery, {
      korime,
      ...(route.kind === 'dgl' && route.sifdv ? { sifdv: route.sifdv } : {}),
    });
    const statuses = mapStatusRows(statusesRaw);
    filter.statuses = mergeStatusesWithDefaults(statuses, String(defaultsRow?.statusichecked ?? ''));
  }

  return filter;
}

async function resolveFilterForModule(
  layout: ModuleLayout,
  route: ModuleRoute,
  apiBaseUrl: string,
  tenantDb: string,
  korime: string,
  cached: DocumentFilter | undefined,
): Promise<{ filter: DocumentFilter; filterBaseline: DocumentFilter }> {
  const filterBaseline = await bootstrapFilters(layout, route, apiBaseUrl, tenantDb, korime);
  const filter = cached
    ? applyCachedFilterPreferences(filterBaseline, cached)
    : cloneFilter(filterBaseline);
  return { filter, filterBaseline };
}

function rememberFilterInCache(state: DocumentsState) {
  if (!state.route) {
    return;
  }
  state.filterCache[moduleFilterCacheKey(state.route)] = cloneFilter(state.filter);
}

export const applyDocumentFilters = createAsyncThunk<
  { filter: DocumentFilter; list: Record<string, unknown>[] },
  void,
  { state: RootState; rejectValue: string }
>('documents/applyFilters', async (_, { getState, rejectWithValue }) => {
  const state = getState();
  const { route, layout, filterTemp } = state.documents;
  const { core, user } = state.auth;
  if (!route || !layout || !filterTemp || !core || !user) {
    return rejectWithValue('Filter nije spreman za primjenu.');
  }
  try {
    const list = await fetchListForModule(
      route,
      layout,
      filterTemp,
      core.apiBaseUrl,
      getTenantDb(state),
      user.korime,
      user.sifosobe as string | number | undefined,
    );
    return { filter: cloneFilter(filterTemp), list };
  } catch (error) {
    return rejectWithValue(toUserMessage(error));
  }
});

function isSameDocumentModule(current: ModuleRoute | null, next: ModuleRoute | null): boolean {
  if (!current || !next || current.kind !== next.kind) {
    return false;
  }
  if (current.kind === 'dgl' && next.kind === 'dgl') {
    return current.sifdv === next.sifdv && current.folder === next.folder;
  }
  return current.folder === next.folder;
}

export const loadDocumentModule = createAsyncThunk<
  {
    route: ModuleRoute;
    layout: ModuleLayout;
    list: Record<string, unknown>[];
    filter: DocumentFilter;
    filterBaseline: DocumentFilter;
    searchFields: string[];
    settings: Record<string, unknown>;
  },
  ModuleMenuEntry,
  { state: RootState; rejectValue: string }
>('documents/loadModule', async (module, { getState, rejectWithValue }) => {
  const { core, user } = getState().auth;
  if (!core || !user) {
    return rejectWithValue('Sesija nije spremna za dohvat modula.');
  }

  const route = resolveModuleRoute(module, user.sifgrupe as string | number | undefined);
  if (!route) {
    return rejectWithValue('Ovaj modul još nije podržan u Expo aplikaciji.');
  }

  try {
    const rawLayout = await fetchModuleLayout({
      apiBaseUrl: core.apiBaseUrl,
      layoutPrefix: core.layoutprefix,
      folder: route.folder,
      fallbackFolder: route.fallbackFolder,
    });

    const mergedLayout = mergeFetchedModuleLayout(rawLayout, route, core.layoutprefix);

    const validation = normalizeModuleLayout(mergedLayout, route);
    if (!validation.ok) {
      return rejectWithValue(validation.error);
    }

    const tenantDb = getTenantDb(getState());
    let settings: Record<string, unknown> = {};
    let searchFields: string[] = [];

    if (validation.layout.settingsQuery) {
      const settingsRaw = await runSpQuery(core.apiBaseUrl, tenantDb, validation.layout.settingsQuery, {
        korime: user.korime,
        sifosobe: user.sifosobe,
        ...(route.kind === 'dgl' && route.sifdv ? { sifdv: route.sifdv } : {}),
      });
      settings = normalizeModuleSettings(settingsRaw);
      searchFields = parseSearchFields(settings.searchfields);
    }
    if (searchFields.length === 0) {
      if (route.layoutSource === 'servis-rn') {
        searchFields = ['brojdokumenta', 'nazpartnera', 'nazpred', 'napomena7', 'komentar', 'status'];
      } else if (route.layoutSource === 'servis-dniz') {
        searchFields = ['brojdokumenta', 'nazpartnera', 'nazpred', 'komentar'];
      }
    }

    const cacheKey = moduleFilterCacheKey(route);
    const cached = getState().documents.filterCache[cacheKey];
    const { filter, filterBaseline } = await resolveFilterForModule(
      validation.layout,
      route,
      core.apiBaseUrl,
      tenantDb,
      user.korime,
      cached,
    );
    const list = await fetchListForModule(
      route,
      validation.layout,
      filter,
      core.apiBaseUrl,
      tenantDb,
      user.korime,
      user.sifosobe as string | number | undefined,
    );

    return { route, layout: validation.layout, list, filter, filterBaseline, searchFields, settings };
  } catch (error) {
    return rejectWithValue(toUserMessage(error));
  }
}, {
  // Nakon Akcije→RN već je učitan isti dgl modul — ne briši selectedItem/route reloadom liste.
  condition: (module, { getState }) => {
    const state = getState();
    if (state.documents.layoutStatus.loading) {
      return false;
    }
    const sifgrupe = state.auth.user?.sifgrupe as string | number | undefined;
    const next = resolveModuleRoute(module, sifgrupe);
    return !isSameDocumentModule(state.documents.route, next);
  },
});

export const refreshDocumentList = createAsyncThunk<Record<string, unknown>[], void, { state: RootState; rejectValue: string }>(
  'documents/refreshList',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const { route, layout, filter } = state.documents;
    const { core, user } = state.auth;
    if (!route || !layout || !core || !user) {
      return rejectWithValue('Modul nije učitan.');
    }
    try {
      return await fetchListForModule(
        route,
        layout,
        filter,
        core.apiBaseUrl,
        getTenantDb(state),
        user.korime,
        user.sifosobe as string | number | undefined,
      );
    } catch (error) {
      return rejectWithValue(toUserMessage(error));
    }
  },
);

/**
 * Dohvat stavki dokumenta — identičan obrazac kao src/pages/dgl/store getListItem
 * (queries.dst.list + dglid/korime/sifosobe/samomoje). Header polja dolaze iz liste;
 * ovaj poziv puni samo dst redove.
 */
export const loadDocumentLines = createAsyncThunk<
  { lines: Record<string, unknown>[]; itemId: string | number },
  void,
  { state: RootState; rejectValue: string }
>(
  'documents/loadLines',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const { route, layout, selectedItem, filter } = state.documents;
    const { core, user } = state.auth;
    if (!route || !layout || !selectedItem || !core || !user) {
      return rejectWithValue('Stavke nisu spremne za dohvat.');
    }
    if (!layout.dstListQuery) {
      return rejectWithValue('Ovaj modul nema definiciju stavki u layoutu.');
    }

    const itemId = readItemId(route, selectedItem);
    if (itemId === undefined) {
      return rejectWithValue('Dokument nema identifikator za dohvat stavki.');
    }

    try {
      const raw = await runSpQuery(core.apiBaseUrl, getTenantDb(state), layout.dstListQuery, {
        korime: user.korime,
        sifosobe: user.sifosobe,
        samomoje: filter.samomoje,
        [route.idField]: itemId,
      });
      return { lines: normalizeDocumentList(raw), itemId };
    } catch (error) {
      return rejectWithValue(toUserMessage(error));
    }
  },
  {
    condition: (_, { getState }) => !getState().documents.dstLinesStatus.loading,
  },
);

/** Vraća dst redove filtrirane po tipu — isto kao Tab3 filter po params.tip. */
export function filterDstLinesByKind(
  lines: Record<string, unknown>[],
  kind: DstLineKind,
): Record<string, unknown>[] {
  return lines.filter((row) => String(row.tip ?? 'stavke') === kind);
}

/** Ima li modul definirane stavke u layoutu i SP-u. */
export function moduleHasDstLines(layout: ModuleLayout | null): boolean {
  return !!layout?.dstListQuery && layout.dstListItems.length > 0;
}

/**
 * Može li se stavka spremati kroz JSON konfiguraciju (queries.dst.azur). Trenutno nijedan
 * tenant layout ovo ne definira (v. DECISION_LOG.md D025/D026, OPEN_QUESTIONS.md #16) —
 * dok se ne doda, forma stavke ostaje dostupna za pregled polja ali Spremi javlja jasnu grešku.
 */
export function moduleHasDstEditing(layout: ModuleLayout | null): boolean {
  return !!layout?.dstAzurQuery && (layout.dstEditItems.length > 0 || layout.dstEditItemsRad.length > 0);
}

export function dstEditLayoutFor(layout: ModuleLayout, kind: DstLineKind): EditFieldDef[] {
  return kind === 'rad' ? layout.dstEditItemsRad : layout.dstEditItems;
}

export function readItemId(route: ModuleRoute, item: Record<string, unknown> | null): string | number | undefined {
  const value = item?.[route.idField];
  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
}

/**
 * Odgovor SP-a za novi zapis ima različit oblik po kind-u (v. src/pages/dgl/store saveDGL:
 * `data.newdglid[0].dglid`; src/pages/gen/store saveGla: `data[0].id`) — obje strane su
 * potvrđene iz Ionic izvora, ne pretpostavljene.
 */
function extractNewRecordId(kind: ModuleRoute['kind'], idField: ModuleRoute['idField'], raw: unknown): string | number | undefined {
  const readId = (row: Record<string, unknown> | undefined): string | number | undefined => {
    if (!row) return undefined;
    const value = row[idField] ?? row.dglid ?? row.DglId ?? row.DGLID ?? row.id;
    return typeof value === 'string' || typeof value === 'number' ? value : undefined;
  };

  const firstRow = (node: unknown): Record<string, unknown> | undefined => {
    if (Array.isArray(node) && node[0] && typeof node[0] === 'object') {
      return node[0] as Record<string, unknown>;
    }
    if (node && typeof node === 'object') {
      const value = (node as { value?: unknown }).value;
      if (Array.isArray(value) && value[0] && typeof value[0] === 'object') {
        return value[0] as Record<string, unknown>;
      }
    }
    return undefined;
  };

  if (kind === 'dgl') {
    if (Array.isArray(raw)) {
      return readId(firstRow(raw));
    }
    if (!raw || typeof raw !== 'object') {
      return undefined;
    }
    const record = raw as Record<string, unknown>;
    // Ionic: data.newdglid[0].dglid — API može vratiti i table* / value envelope.
    for (const key of ['newdglid', 'NewDglId', 'table1', 'table2', 'value'] as const) {
      const id = readId(firstRow(record[key]));
      if (id !== undefined) {
        return id;
      }
    }
    return readId(record);
  }

  const rows = normalizeDocumentList(raw);
  return readId(rows[0]);
}

/** Ponovni dohvat jednog retka nakon spremanja — isti obrazac kao Ionic getGla (queries.{group}.list + id parametar). */
export const reloadDocumentItem = createAsyncThunk<
  Record<string, unknown> | null,
  string | number,
  { state: RootState; rejectValue: string }
>('documents/reloadItem', async (id, { getState, dispatch, rejectWithValue }) => {
  const state = getState();
  const { route, layout } = state.documents;
  const { core, user } = state.auth;
  if (!route || !layout || !core || !user) {
    return rejectWithValue('Modul nije učitan.');
  }
  try {
    const raw = await runSpQuery(core.apiBaseUrl, getTenantDb(state), layout.listQuery, {
      korime: user.korime,
      [route.idField]: id,
    });
    const rows = normalizeDocumentList(raw);
    dispatch(refreshDocumentList());
    return rows[0] ?? null;
  } catch (error) {
    return rejectWithValue(toUserMessage(error));
  }
});

/**
 * Sprema formu (novi zapis ili izmjena postojećeg) — replicira src/pages/dgl/store saveDGL
 * (spWeb_UpdateDGL, uvijek isti za sve dgl tenante) i src/pages/gen/store saveGla
 * (queries.gla.azur.sp). `editItemsExtends` se spaja sirovo u payload — makroi (#today,
 * #sifosobe) se ne rješavaju na klijentu (v. OPEN_QUESTIONS.md #4), backend ih interpretira.
 */
export const saveDocumentForm = createAsyncThunk<
  { id: string | number },
  void,
  { state: RootState; rejectValue: string }
>('documents/saveForm', async (_, { getState, dispatch, rejectWithValue }) => {
  const state = getState();
  const { route, layout, editFormData, selectedItem } = state.documents;
  const { core, user } = state.auth;
  if (!route || !layout || !core || !user || !editFormData) {
    return rejectWithValue('Forma nije spremna za spremanje.');
  }

  const existingId = readItemId(route, selectedItem);
  // Ionic DNIZ Tab1 šalje sifdv+datumdokumenta (YYYYMMDD) u formData — ne ovisi o #today makroima.
  const formPayload: Record<string, unknown> = {
    ...editFormData,
    ...layout.editItemsExtends,
  };
  if (route.layoutSource === 'servis-dniz') {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    formPayload.sifdv = 'DNIZ';
    formPayload.datumdokumenta = `${y}${m}${d}`;
    formPayload.izradilasifosobe = user.sifosobe;
  }
  const dglJson = JSON.stringify(formPayload);
  const tenantDb = getTenantDb(state);

  let sp: string;
  let params: Record<string, unknown>;

  if (route.kind === 'dgl') {
    sp = 'spWeb_UpdateDGL';
    params = {
      sifdv: route.sifdv,
      korime: user.korime,
      sifosobe: user.sifosobe,
      dglid: existingId,
      dglJson,
    };
  } else {
    if (!layout.azurQuery) {
      return rejectWithValue('Spremanje ovog modula nije podržano (nedostaje queries.gla.azur u layoutu).');
    }
    sp = layout.azurQuery.sp;
    params = {
      ...layout.azurQuery.params,
      app: route.app,
      module: route.module,
      korime: user.korime,
      sifosobe: user.sifosobe,
      id: existingId,
      dglJson,
    };
  }

  try {
    const raw = await runSpQuery(core.apiBaseUrl, tenantDb, { sp }, params);
    const id = existingId ?? extractNewRecordId(route.kind, route.idField, raw);
    if (id === undefined) {
      return rejectWithValue('Spremanje nije uspjelo — odgovor ne sadrži identifikator zapisa.');
    }
    await dispatch(reloadDocumentItem(id));
    return { id };
  } catch (error) {
    return rejectWithValue(toUserMessage(error));
  }
});

/**
 * Sprema stavku dokumenta (nova/izmjena/podstavka) — ekvivalent Ionic src/pages/dgl/store
 * saveDoc. Za razliku od Ionica, NE poziva hardkodirani spMob_ZJUKIC_DST_Azur za sve tenante
 * (v. D025) — zahtijeva `queries.dst.azur` u layoutu i odbija spremanje jasnom porukom ako
 * nedostaje, umjesto da tiho pozove tuđi tenant SP.
 */
export const saveDstLine = createAsyncThunk<void, void, { state: RootState; rejectValue: string }>(
  'documents/saveDstLine',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const { route, layout, editFormData, dstEditContext } = state.documents;
    const { core, user } = state.auth;
    if (!route || !layout || !core || !user || !editFormData || !dstEditContext) {
      return rejectWithValue('Forma stavke nije spremna za spremanje.');
    }
    if (!layout.dstAzurQuery) {
      return rejectWithValue('Spremanje stavki nije podržano za ovaj modul (nedostaje queries.dst.azur u layoutu).');
    }

    const headerId = readItemId(route, state.documents.selectedItem);
    if (headerId === undefined) {
      return rejectWithValue('Dokument nema identifikator za spremanje stavke.');
    }

    const extendsItems = dstEditContext.kind === 'rad' ? layout.dstEditItemsRadExtends : layout.dstEditItemsExtends;
    // Ionic DetailAzurNew stavlja parentdstid/s u formData → jsonUpdatedValues,
    // ne kao top-level SP parametre (spMob_*_DST_Azur ih nema — v. TFS SP potpis).
    const payload: Record<string, unknown> = {
      ...sanitizeDstJsonPayload(editFormData),
      ...extendsItems,
    };
    if (dstEditContext.parentId !== null) {
      payload.parentdstid = dstEditContext.parentId;
      payload.s = 2;
    }
    if (dstEditContext.dstId != null) {
      payload.dstid = dstEditContext.dstId;
    }

    // Ionic servis/RadniNalozi saveDoc šalje flat action=update + kolicina/sifart/opis
    // (ne jsonUpdatedValues / action=azur).
    const params: Record<string, unknown> =
      route.layoutSource === 'servis-rn'
        ? {
            ...layout.dstAzurQuery.params,
            action: 'update',
            dglid: headerId,
            dstid: dstEditContext.dstId ?? undefined,
            kolicina: payload.kolicina ?? payload.kol,
            sifart: payload.sifart,
            opis: payload.opis ?? payload.opisartikla,
          }
        : {
            ...layout.dstAzurQuery.params,
            action: 'azur',
            [route.idField]: headerId,
            dstid: dstEditContext.dstId ?? undefined,
            korime: user.korime,
            sifosobe: user.sifosobe,
            jsonUpdatedValues: JSON.stringify(payload),
          };

    if (__DEV__) {
      console.info('[documents/saveDstLine] params', params);
    }

    try {
      await runSpQuery(core.apiBaseUrl, getTenantDb(state), layout.dstAzurQuery, params);
      await dispatch(loadDocumentLines());
    } catch (error) {
      return rejectWithValue(toUserMessage(error));
    }
  },
);

/**
 * Brisanje stavke — ekvivalent Ionic deleteDst (queries.dst.delete + action deleteDst).
 */
export const deleteDstLine = createAsyncThunk<void, string | number, { state: RootState; rejectValue: string }>(
  'documents/deleteDstLine',
  async (dstId, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const { layout } = state.documents;
    const { core } = state.auth;
    if (!layout || !core) {
      return rejectWithValue('Modul nije učitan.');
    }
    if (!layout.dstDeleteQuery) {
      return rejectWithValue('Brisanje stavki nije podržano (nedostaje queries.dst.delete u layoutu).');
    }
    try {
      await runSpQuery(core.apiBaseUrl, getTenantDb(state), layout.dstDeleteQuery, {
        ...layout.dstDeleteQuery.params,
        action: 'deleteDst',
        dstid: dstId,
      });
      await dispatch(loadDocumentLines());
    } catch (error) {
      return rejectWithValue(toUserMessage(error));
    }
  },
  {
    condition: (_, { getState }) => !getState().documents.dstLinesStatus.loading,
  },
);

/** Potvrda količine — Ionic dstPotvrdaKolcine (dst.azur + action potvrdaKolicine). */
export const confirmDstQuantity = createAsyncThunk<void, string | number, { state: RootState; rejectValue: string }>(
  'documents/confirmDstQuantity',
  async (dstId, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const { layout } = state.documents;
    const { core } = state.auth;
    if (!layout || !core) {
      return rejectWithValue('Modul nije učitan.');
    }
    if (!layout.dstAzurQuery) {
      return rejectWithValue('Potvrda količine nije podržana (nedostaje queries.dst.azur u layoutu).');
    }
    try {
      await runSpQuery(core.apiBaseUrl, getTenantDb(state), layout.dstAzurQuery, {
        ...layout.dstAzurQuery.params,
        action: 'potvrdaKolicine',
        dstid: dstId,
      });
      await dispatch(loadDocumentLines());
    } catch (error) {
      return rejectWithValue(toUserMessage(error));
    }
  },
  {
    condition: (_, { getState }) => !getState().documents.dstLinesStatus.loading,
  },
);

/** Uklanjanje potvrđene količine — Ionic dstDeletePotvrdaKolcine. */
export const removeDstQuantityConfirm = createAsyncThunk<
  void,
  string | number,
  { state: RootState; rejectValue: string }
>(
  'documents/removeDstQuantityConfirm',
  async (dstId, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const { layout } = state.documents;
    const { core } = state.auth;
    if (!layout || !core) {
      return rejectWithValue('Modul nije učitan.');
    }
    if (!layout.dstAzurQuery) {
      return rejectWithValue('Uklanjanje potvrde nije podržano (nedostaje queries.dst.azur u layoutu).');
    }
    try {
      await runSpQuery(core.apiBaseUrl, getTenantDb(state), layout.dstAzurQuery, {
        ...layout.dstAzurQuery.params,
        action: 'deletePotvrdaKolicine',
        dstid: dstId,
      });
      await dispatch(loadDocumentLines());
    } catch (error) {
      return rejectWithValue(toUserMessage(error));
    }
  },
  {
    condition: (_, { getState }) => !getState().documents.dstLinesStatus.loading,
  },
);

/** Ponovno učitava layout i dopunjava queries.dst ako su nedostajali (hot reload / stari cache). */
export const refreshLayoutDstQueries = createAsyncThunk<
  ModuleLayout | null,
  void,
  { state: RootState; rejectValue: string }
>('documents/refreshLayoutDstQueries', async (_, { getState, rejectWithValue }) => {
  const state = getState();
  const { route, layout } = state.documents;
  const { core } = state.auth;
  if (!route || !core) {
    return null;
  }
  if (layoutHasDstActions(layout)) {
    return null;
  }

  try {
    const rawLayout = await fetchModuleLayout({
      apiBaseUrl: core.apiBaseUrl,
      layoutPrefix: core.layoutprefix,
      folder: route.folder,
      fallbackFolder: route.fallbackFolder,
    });
    const mergedLayout = mergeFetchedModuleLayout(rawLayout, route, core.layoutprefix);
    const validation = normalizeModuleLayout(mergedLayout, route);
    if (!validation.ok) {
      return rejectWithValue(validation.error);
    }
    return validation.layout;
  } catch (error) {
    return rejectWithValue(toUserMessage(error));
  }
});

/** Ima li modul privitke — u Ionicu tab "Privitci" postoji samo za dgl (v. types.ts priloziQuery napomena, D027). */
export function moduleHasAttachments(route: ModuleRoute | null, layout: ModuleLayout | null): boolean {
  return route?.kind === 'dgl' && !!layout?.priloziQuery;
}

/** gen tab Akcije — v. src/pages/gen/tabs/TabAkcije.jsx (queries.gla.createdoc). */
export function moduleHasActions(route: ModuleRoute | null, layout: ModuleLayout | null): boolean {
  return route?.kind === 'gen' && !!layout?.createDocQuery;
}

/**
 * Kreira povezani dokument (npr. radni nalog iz CRM upita) — gen/store createDoc.
 * Vraća prvi redak SP odgovora (brojdokumenta, dglid, sifdv…).
 */
export const createLinkedDocument = createAsyncThunk<
  { dglid: string | number; brojdokumenta: string; sifdv: string },
  void,
  { state: RootState; rejectValue: string }
>('documents/createLinkedDocument', async (_, { getState, rejectWithValue }) => {
  const state = getState();
  const { route, layout, selectedItem } = state.documents;
  const { core, user } = state.auth;
  if (!route || route.kind !== 'gen' || !layout?.createDocQuery || !selectedItem || !core || !user) {
    return rejectWithValue('Kreiranje povezanog dokumenta nije dostupno.');
  }
  const itemId = readItemId(route, selectedItem);
  if (itemId === undefined) {
    return rejectWithValue('Zapis nema identifikator za kreiranje dokumenta.');
  }
  if (!route.app || !route.module) {
    return rejectWithValue('Modul nema app/module parametre.');
  }

  try {
    const tenantDb = getTenantDb(state);
    const raw = await runSpQuery(core.apiBaseUrl, tenantDb, layout.createDocQuery, {
      ...layout.createDocQuery.params,
      app: route.app,
      module: route.module,
      korime: user.korime,
      sifosobe: user.sifosobe,
      id: itemId,
    });
    if (__DEV__) {
      console.info('[documents/createLinkedDocument] raw', raw);
    }
    const rows = normalizeDocumentList(raw);
    const created = rows[0];
    if (!created) {
      return rejectWithValue('Server nije vratio podatke o kreiranom dokumentu.');
    }

    const dglidRaw = readRowField(created, 'dglid');
    const dglid =
      typeof dglidRaw === 'number' || typeof dglidRaw === 'string' ? dglidRaw : undefined;
    if (dglid === undefined) {
      return rejectWithValue('Server nije vratio dglid kreiranog dokumenta.');
    }

    let sifdv = readSifdvFromDglRow(created);
    if (!sifdv) {
      sifdv = await resolveSifdvForCreatedRn(core.apiBaseUrl, tenantDb, dglid, user.korime);
    }
    if (!sifdv) {
      return rejectWithValue(
        `Radni nalog je kreiran (broj=${readRowField(created, 'brojdokumenta') ?? dglid}), ali nije moguće pročitati vrstu dokumenta (sifdv) za otvaranje. Otvorite ga iz modula Radni nalozi.`,
      );
    }

    const broj = String(readRowField(created, 'brojdokumenta', 'broj') ?? '');
    return { dglid, brojdokumenta: broj, sifdv };
  } catch (error) {
    return rejectWithValue(toUserMessage(error));
  }
});

/**
 * Otvara kreirani radni nalog u dgl kontekstu — Ionic TabAkcije openSRN:
 * selectApp(servis-mobile) + selectModuleBySifDv + layout/list + copyRNfromUpit.
 * Bez prebacivanja selectedModule ostaje "Upiti" u headeru, a route/layout postanu RN
 * → korisnik vidi upite u listi s RN tabovima (Info/Stavke/Privitci).
 */
export const openRadniNalogFromUpit = createAsyncThunk<
  {
    route: ModuleRoute;
    layout: ModuleLayout;
    selectedItem: Record<string, unknown>;
    filter: DocumentFilter;
    filterBaseline: DocumentFilter;
    list: Record<string, unknown>[];
    searchFields: string[];
    settings: Record<string, unknown>;
  },
  { sifdv: string; dglid: string | number },
  { state: RootState; rejectValue: string }
>('documents/openRadniNalogFromUpit', async ({ sifdv, dglid }, { getState, rejectWithValue }) => {
  const state = getState();
  const { core, user } = state.auth;
  if (!core || !user) {
    return rejectWithValue('Sesija nije spremna.');
  }

  const route = buildDglModuleRoute(sifdv, user.sifgrupe as string | number | undefined);

  try {
    const rawLayout = await fetchModuleLayout({
      apiBaseUrl: core.apiBaseUrl,
      layoutPrefix: core.layoutprefix,
      folder: route.folder,
      fallbackFolder: route.fallbackFolder,
    });

    const mergedLayout = mergeFetchedModuleLayout(rawLayout, route, core.layoutprefix);
    const validation = normalizeModuleLayout(mergedLayout, route);
    if (!validation.ok) {
      return rejectWithValue(validation.error);
    }

    const layout = validation.layout;
    const tenantDb = getTenantDb(state);

    let settings: Record<string, unknown> = {};
    let searchFields: string[] = [];
    if (layout.settingsQuery) {
      const settingsRaw = await runSpQuery(core.apiBaseUrl, tenantDb, layout.settingsQuery, {
        korime: user.korime,
        sifosobe: user.sifosobe,
        sifdv: route.sifdv,
      });
      settings = normalizeModuleSettings(settingsRaw);
      searchFields = parseSearchFields(settings.searchfields);
    }

    const cacheKey = moduleFilterCacheKey(route);
    const cached = getState().documents.filterCache[cacheKey];
    const { filter, filterBaseline } = await resolveFilterForModule(
      layout,
      route,
      core.apiBaseUrl,
      tenantDb,
      user.korime,
      cached,
    );
    const list = await fetchListForModule(
      route,
      layout,
      filter,
      core.apiBaseUrl,
      tenantDb,
      user.korime,
      user.sifosobe as string | number | undefined,
    );

    const raw = await runSpQuery(core.apiBaseUrl, tenantDb, layout.listQuery, {
      korime: user.korime,
      dglid,
    });
    const selectedItem = normalizeDocumentList(raw)[0];
    if (!selectedItem) {
      return rejectWithValue('Radni nalog nije pronađen.');
    }

    return { route, layout, selectedItem, filter, filterBaseline, list, searchFields, settings };
  } catch (error) {
    return rejectWithValue(toUserMessage(error));
  }
});

/**
 * Dohvat privitaka dokumenta — ekvivalent Ionic dgl/store getPrivitci (queries.dgl.prilozi
 * + korime/dglid). Prikaz retka je hardkodiran na `naziv` u Ionicu (TabPrivitci.jsx), nema
 * JSON layouta za listu privitaka — isto se radi i ovdje.
 */
export const loadAttachments = createAsyncThunk<
  { attachments: Record<string, unknown>[]; itemId: string | number },
  void,
  { state: RootState; rejectValue: string }
>('documents/loadAttachments', async (_, { getState, rejectWithValue }) => {
  const state = getState();
  const { route, layout, selectedItem } = state.documents;
  const { core, user } = state.auth;
  if (!route || !layout || !selectedItem || !core || !user) {
    return rejectWithValue('Privitci nisu spremni za dohvat.');
  }
  if (!moduleHasAttachments(route, layout) || !layout.priloziQuery) {
    return rejectWithValue('Ovaj modul nema definiciju privitaka u layoutu.');
  }
  const itemId = readItemId(route, selectedItem);
  if (itemId === undefined) {
    return rejectWithValue('Dokument nema identifikator za dohvat privitaka.');
  }
  try {
    const raw = await runSpQuery(core.apiBaseUrl, getTenantDb(state), layout.priloziQuery, {
      korime: user.korime,
      dglid: itemId,
    });
    return { attachments: normalizeDocumentList(raw), itemId };
  } catch (error) {
    return rejectWithValue(toUserMessage(error));
  }
});

/**
 * Upload odabranih datoteka — ekvivalent Ionic TabPrivitci.jsx appendFileToFormData
 * (saveAttachments preko /saveatt, potom ponovni dohvat liste).
 */
export const uploadAttachments = createAsyncThunk<
  void,
  AttachmentUploadFile[],
  { state: RootState; rejectValue: string }
>('documents/uploadAttachments', async (files, { getState, dispatch, rejectWithValue }) => {
  const state = getState();
  const { route, selectedItem } = state.documents;
  const { core } = state.auth;
  if (!route || !selectedItem || !core) {
    return rejectWithValue('Modul nije spreman za slanje privitka.');
  }
  const itemId = readItemId(route, selectedItem);
  if (itemId === undefined) {
    return rejectWithValue('Dokument nema identifikator za slanje privitka.');
  }
  try {
    await uploadAttachmentsRequest({
      apiBaseUrl: core.apiBaseUrl,
      tenantDb: getAttachmentDb(state),
      itemId,
      files,
    });
    await dispatch(loadAttachments());
  } catch (error) {
    return rejectWithValue(toUserMessage(error));
  }
});

/**
 * Preuzimanje i otvaranje privitka — ekvivalent Ionic TabPrivitci.jsx onItemClick
 * (getAttachemnt preko /getatt, potom Filesystem.writeFile + FileOpener.openFile).
 */
export const openAttachment = createAsyncThunk<
  void,
  Record<string, unknown>,
  { state: RootState; rejectValue: string }
>('documents/openAttachment', async (item, { getState, rejectWithValue }) => {
  const state = getState();
  const { core } = state.auth;
  if (!core) {
    return rejectWithValue('Sesija nije spremna.');
  }

  let attachmentId: string | number;
  try {
    attachmentId = resolveAttachmentId(item);
  } catch (error) {
    return rejectWithValue(toUserMessage(error));
  }

  const fileName = resolveAttachmentFileName(item);
  const putanja = typeof item.putanja === 'string' && item.putanja.trim().length > 0 ? item.putanja.trim() : null;

  if (__DEV__) {
    console.log('[attachments] open', { attachmentId, fileName, putanja, keys: Object.keys(item) });
  }

  try {
    const response = await fetchAttachmentRequest({
      apiBaseUrl: core.apiBaseUrl,
      tenantDb: getAttachmentDb(state),
      id: attachmentId,
      fileName,
    });
    await saveAndOpenFile(response.FileName, response.Base64String);
    return;
  } catch (getAttError) {
    if (!putanja) {
      return rejectWithValue(toUserMessage(getAttError));
    }
    try {
      const fromPath = await fetchFileFromPathRequest({
        apiBaseUrl: core.apiBaseUrl,
        path: putanja,
        fileName,
      });
      await saveAndOpenFile(fromPath.FileName, fromPath.Base64String);
    } catch (pathError) {
      const detail = toUserMessage(pathError);
      if (/pristup|dohvat.*datotek|putanj/i.test(detail)) {
        return rejectWithValue(
          'Datoteka je na mrežnom disku poslužitelja, ali API nema pristup toj putanji. Provjerite prava servisa na \\\\Zj-server-bravo\\ ili otvorite privitak iz Ionic aplikacije na istom okruženju.',
        );
      }
      return rejectWithValue(toUserMessage(getAttError));
    }
  }
});

/** Ima li dokument tab "Potpis" — u Ionicu gate je isključivo listItem.tabpotpisvisible, samo za dgl (v. dgl/tabs/MainTabs.tsx). */
export function moduleHasSignature(route: ModuleRoute | null, item: Record<string, unknown> | null): boolean {
  return route?.kind === 'dgl' && Boolean(item?.tabpotpisvisible);
}

/**
 * Sastavlja mailTo/mailSubject/mailBody za REPX izvještaj — replicira src/pages/dgl/tabs/Tab4.jsx
 * getBase64StringReport TOČNO (uklj. da `testEmail` ZAMJENJUJE `kontaktemail`, ne dopunjuje ga).
 */
function buildSignatureReportMail(
  item: Record<string, unknown>,
  properties: ModuleLayout['properties'],
  signatureEmail: string,
): { mailTo: string | undefined; mailSubject: string; mailBody: string } {
  let mailTo = typeof item.kontaktemail === 'string' ? item.kontaktemail : undefined;
  if (properties.testEmail) {
    mailTo = properties.testEmail;
  }
  const trimmedSignatureEmail = signatureEmail.trim();
  if (trimmedSignatureEmail !== '' && mailTo !== undefined) {
    mailTo += `;${trimmedSignatureEmail}`;
  } else if (trimmedSignatureEmail !== '') {
    mailTo = trimmedSignatureEmail;
  }

  let mailSubject = `RADNI NALOG - ${item['broj radnog naloga'] ?? ''}`;
  if (item.nazivobjekta) {
    mailSubject += ` - ${item.nazivobjekta}`;
  }

  const mailBody =
    'Poštovani, <br><br>u prilogu kopija ovjerenog radnog naloga za izvršene usluge.';

  return { mailTo, mailSubject, mailBody };
}

/**
 * Sprema potpis (spMob_DGL_Azur action=insertSignature — generički SP, isti za sve dgl
 * tenante) i, ako je `properties.reportName` definiran, generira/šalje REPX izvještaj te
 * ga, ako je `properties.signatureOpenPdf === true`, odmah preuzima i otvara —
 * ekvivalent Ionic dgl/tabs/Tab4.jsx onClickSpremi + createAndOpenPdf.
 */
export const submitSignature = createAsyncThunk<
  { fileName: string | null },
  { signature: string; signatureText: string; signatureEmail: string },
  { state: RootState; rejectValue: string }
>('documents/submitSignature', async (data, { getState, rejectWithValue }) => {
  const state = getState();
  const { route, layout, selectedItem } = state.documents;
  const { core, user } = state.auth;
  if (!route || route.kind !== 'dgl' || !layout || !selectedItem || !core || !user) {
    return rejectWithValue('Potpis nije spreman za spremanje.');
  }
  const dglid = readItemId(route, selectedItem);
  if (dglid === undefined) {
    return rejectWithValue('Dokument nema identifikator za spremanje potpisa.');
  }
  const tenantDb = getTenantDb(state);

  try {
    // TFS spMob_DGL_Azur (insertSignature) prima samo Signature/SignatureText/SignatureTextField
    // — signatureEmail ide u REPX mailTo, ne u SP (Ionic store šalje email param, ali SP ga nema).
    await runSpQuery(core.apiBaseUrl, tenantDb, { sp: 'spMob_DGL_Azur' }, {
      action: 'insertSignature',
      dglid,
      signature: data.signature,
      signatureText: data.signatureText,
      signatureTextField: layout.properties.signatureTextAzurField,
    });
  } catch (error) {
    return rejectWithValue(toUserMessage(error));
  }

  const { reportName } = layout.properties;
  if (!reportName) {
    return { fileName: null };
  }

  const { mailTo, mailSubject, mailBody } = buildSignatureReportMail(selectedItem, layout.properties, data.signatureEmail);

  try {
    const report = await generateReportRequest({
      apiBaseUrl: core.apiBaseUrl,
      tenantDb,
      reportName,
      parameters: { id: dglid, dglid, ime: data.signatureText },
      mailTo,
      mailSubject,
      mailBody,
    });
    if (layout.properties.signatureOpenPdf) {
      await saveAndOpenFile(report.FileName, report.Base64String);
    }
    return { fileName: report.FileName ?? null };
  } catch (error) {
    return rejectWithValue(toUserMessage(error));
  }
});

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    selectListItem: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.selectedItem = action.payload;
      state.dstLines = [];
      state.dstLinesStatus = { loading: false, error: null };
      state.dstLinesForItemId = null;
      state.dstEditContext = null;
      state.attachments = [];
      state.attachmentsStatus = { loading: false, error: null };
      state.attachmentsForItemId = null;
      state.attachmentOpenError = null;
      state.signatureStatus = { loading: false, error: null };
      state.signatureSavedFileName = null;
    },
    resetDocuments: () => initialState,
    clearSignatureMessage: (state) => {
      state.signatureStatus = { loading: false, error: null };
      state.signatureSavedFileName = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      applySearchToState(state);
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
      state.list = state.originalList;
    },
    openFilterEditor: (state) => {
      state.filterTemp = cloneFilter(state.filter);
    },
    closeFilterEditor: (state) => {
      state.filterTemp = null;
    },
    updateFilterTempField: (state, action: PayloadAction<Partial<DocumentFilter>>) => {
      if (!state.filterTemp) {
        return;
      }
      state.filterTemp = { ...state.filterTemp, ...action.payload };
    },
    toggleFilterTempStatus: (state, action: PayloadAction<string | number>) => {
      if (!state.filterTemp) {
        return;
      }
      state.filterTemp.statuses = state.filterTemp.statuses.map((item) =>
        item.id === action.payload ? { ...item, checked: !item.checked } : item,
      );
    },
    resetFilterTemp: (state) => {
      state.filterTemp = cloneFilter(state.filterBaseline);
    },
    startEditForm: (state, action: PayloadAction<Record<string, unknown> | null>) => {
      // Novi zapis: mora očistiti selectedItem, inače saveDocumentForm šalje stari dglid
      // i tiho radi UPDATE umjesto INSERT (korisnik vidi "uspjeh" bez novog dokumenta).
      if (action.payload === null) {
        state.selectedItem = null;
      }
      state.editValues = action.payload ? { ...action.payload } : {};
      state.editFormData = {};
      state.saveStatus = { loading: false, error: null };
    },
    startDstEditForm: (
      state,
      action: PayloadAction<{ item: Record<string, unknown> | null; kind: DstLineKind; parentId?: string | number }>,
    ) => {
      const { item, kind, parentId } = action.payload;
      state.editValues = item ? { ...item } : {};
      state.editFormData = {};
      state.saveStatus = { loading: false, error: null };
      state.dstEditContext = {
        dstId: (item?.dstid as string | number | undefined) ?? null,
        parentId: parentId ?? null,
        kind,
      };
    },
    updateEditValues: (state, action: PayloadAction<EditControlValues>) => {
      if (!state.editValues) {
        return;
      }
      state.editValues = { ...state.editValues, ...action.payload };
    },
    updateEditFormData: (state, action: PayloadAction<EditControlValues>) => {
      if (!state.editFormData) {
        return;
      }
      state.editFormData = { ...state.editFormData, ...action.payload };
    },
    resetEditForm: (state) => {
      state.editValues = null;
      state.editFormData = null;
      state.saveStatus = { loading: false, error: null };
      state.dstEditContext = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDocumentModule.pending, (state) => {
        rememberFilterInCache(state);
        state.layoutStatus = { loading: true, error: null };
        state.listStatus = { loading: false, error: null };
        state.route = null;
        state.layout = null;
        state.list = [];
        state.originalList = [];
        state.searchQuery = '';
        state.dstLines = [];
        state.dstLinesStatus = { loading: false, error: null };
        state.dstLinesForItemId = null;
        state.dstEditContext = null;
        state.attachments = [];
        state.attachmentsStatus = { loading: false, error: null };
        state.attachmentsForItemId = null;
        state.attachmentOpenError = null;
        state.signatureStatus = { loading: false, error: null };
        state.signatureSavedFileName = null;
      })
      .addCase(loadDocumentModule.fulfilled, (state, action) => {
        state.layoutStatus = { loading: false, error: null };
        state.route = action.payload.route;
        state.layout = action.payload.layout;
        state.filter = action.payload.filter;
        state.filterBaseline = cloneFilter(action.payload.filterBaseline);
        state.filterTemp = null;
        state.filterCache[moduleFilterCacheKey(action.payload.route)] = cloneFilter(action.payload.filter);
        state.settings = action.payload.settings;
        state.searchFields = action.payload.searchFields;
        state.originalList = action.payload.list;
        state.list = action.payload.list;
      })
      .addCase(loadDocumentModule.rejected, (state, action) => {
        state.layoutStatus = { loading: false, error: action.payload ?? 'Modul nije moguće učitati.' };
      })
      .addCase(refreshDocumentList.pending, (state) => {
        state.listStatus = { loading: true, error: null };
      })
      .addCase(refreshDocumentList.fulfilled, (state, action) => {
        state.listStatus = { loading: false, error: null };
        state.originalList = action.payload;
        applySearchToState(state);
      })
      .addCase(refreshDocumentList.rejected, (state, action) => {
        state.listStatus = { loading: false, error: action.payload ?? 'Dohvat liste nije uspio.' };
      })
      .addCase(applyDocumentFilters.pending, (state) => {
        state.listStatus = { loading: true, error: null };
      })
      .addCase(applyDocumentFilters.fulfilled, (state, action) => {
        state.filter = action.payload.filter;
        state.filterTemp = null;
        state.originalList = action.payload.list;
        applySearchToState(state);
        state.listStatus = { loading: false, error: null };
        rememberFilterInCache(state);
      })
      .addCase(applyDocumentFilters.rejected, (state, action) => {
        state.listStatus = { loading: false, error: action.payload ?? 'Primjena filtera nije uspjela.' };
      })
      .addCase(saveDocumentForm.pending, (state) => {
        state.saveStatus = { loading: true, error: null };
      })
      .addCase(saveDocumentForm.fulfilled, (state) => {
        // editValues/editFormData se čiste tek na unmount forme (v. form.tsx), ne ovdje —
        // izbjegava kratki "Forma nije spremna" prikaz dok traje back-navigacija animacija.
        state.saveStatus = { loading: false, error: null };
      })
      .addCase(saveDocumentForm.rejected, (state, action) => {
        state.saveStatus = { loading: false, error: action.payload ?? 'Spremanje nije uspjelo.' };
      })
      .addCase(saveDstLine.pending, (state) => {
        state.saveStatus = { loading: true, error: null };
      })
      .addCase(saveDstLine.fulfilled, (state) => {
        state.saveStatus = { loading: false, error: null };
      })
      .addCase(saveDstLine.rejected, (state, action) => {
        state.saveStatus = { loading: false, error: action.payload ?? 'Spremanje stavke nije uspjelo.' };
      })
      .addCase(reloadDocumentItem.fulfilled, (state, action) => {
        if (action.payload) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(loadDocumentLines.pending, (state) => {
        state.dstLinesStatus = { loading: true, error: null };
      })
      .addCase(loadDocumentLines.fulfilled, (state, action) => {
        state.dstLinesStatus = { loading: false, error: null };
        state.dstLines = action.payload.lines;
        state.dstLinesForItemId = action.payload.itemId;
      })
      .addCase(loadDocumentLines.rejected, (state, action) => {
        state.dstLinesStatus = { loading: false, error: action.payload ?? 'Dohvat stavki nije uspio.' };
      })
      .addCase(refreshLayoutDstQueries.fulfilled, (state, action) => {
        if (action.payload) {
          state.layout = action.payload;
        }
      })
      .addCase(loadAttachments.pending, (state) => {
        state.attachmentsStatus = { loading: true, error: null };
      })
      .addCase(loadAttachments.fulfilled, (state, action) => {
        state.attachmentsStatus = { loading: false, error: null };
        state.attachments = action.payload.attachments;
        state.attachmentsForItemId = action.payload.itemId;
      })
      .addCase(loadAttachments.rejected, (state, action) => {
        state.attachmentsStatus = { loading: false, error: action.payload ?? 'Dohvat privitaka nije uspio.' };
      })
      .addCase(uploadAttachments.pending, (state) => {
        state.attachmentUploadStatus = { loading: true, error: null };
      })
      .addCase(uploadAttachments.fulfilled, (state) => {
        state.attachmentUploadStatus = { loading: false, error: null };
      })
      .addCase(uploadAttachments.rejected, (state, action) => {
        state.attachmentUploadStatus = { loading: false, error: action.payload ?? 'Slanje privitka nije uspjelo.' };
      })
      .addCase(openAttachment.pending, (state, action) => {
        try {
          state.attachmentOpeningId = resolveAttachmentId(action.meta.arg);
        } catch {
          state.attachmentOpeningId = null;
        }
        state.attachmentOpenError = null;
      })
      .addCase(openAttachment.fulfilled, (state) => {
        state.attachmentOpeningId = null;
      })
      .addCase(openAttachment.rejected, (state, action) => {
        state.attachmentOpeningId = null;
        state.attachmentOpenError = action.payload ?? 'Otvaranje privitka nije uspjelo.';
      })
      .addCase(submitSignature.pending, (state) => {
        state.signatureStatus = { loading: true, error: null };
        state.signatureSavedFileName = null;
      })
      .addCase(submitSignature.fulfilled, (state, action) => {
        state.signatureStatus = { loading: false, error: null };
        state.signatureSavedFileName = action.payload.fileName;
        // Ekvivalent Ionic setItemDataSignature — odmah ažurira prikazano polje imena
        // potpisnika u trenutnom retku, bez punog reload-a dokumenta.
        const textField = state.layout?.properties.signatureTextSelectField;
        if (state.selectedItem && textField) {
          state.selectedItem = { ...state.selectedItem, [textField]: action.meta.arg.signatureText };
        }
      })
      .addCase(submitSignature.rejected, (state, action) => {
        state.signatureStatus = { loading: false, error: action.payload ?? 'Spremanje potpisa nije uspjelo.' };
      })
      .addCase(openRadniNalogFromUpit.pending, (state) => {
        rememberFilterInCache(state);
      })
      .addCase(openRadniNalogFromUpit.fulfilled, (state, action) => {
        state.route = action.payload.route;
        state.layout = action.payload.layout;
        state.selectedItem = action.payload.selectedItem;
        state.filter = action.payload.filter;
        state.filterBaseline = cloneFilter(action.payload.filterBaseline);
        state.filterTemp = null;
        state.filterCache[moduleFilterCacheKey(action.payload.route)] = cloneFilter(action.payload.filter);
        state.settings = action.payload.settings;
        state.searchFields = action.payload.searchFields;
        state.originalList = action.payload.list;
        state.list = action.payload.list;
        state.searchQuery = '';
        state.layoutStatus = { loading: false, error: null };
        state.listStatus = { loading: false, error: null };
        state.dstLines = [];
        state.dstLinesStatus = { loading: false, error: null };
        state.dstLinesForItemId = null;
        state.dstEditContext = null;
        state.attachments = [];
        state.attachmentsStatus = { loading: false, error: null };
        state.attachmentsForItemId = null;
        state.attachmentOpenError = null;
        state.signatureStatus = { loading: false, error: null };
        state.signatureSavedFileName = null;
      });
  },
});

export const {
  selectListItem,
  resetDocuments,
  clearSignatureMessage,
  setSearchQuery,
  clearSearchQuery,
  openFilterEditor,
  closeFilterEditor,
  updateFilterTempField,
  toggleFilterTempStatus,
  resetFilterTemp,
  startEditForm,
  startDstEditForm,
  updateEditValues,
  updateEditFormData,
  resetEditForm,
} = documentsSlice.actions;

export default documentsSlice.reducer;
