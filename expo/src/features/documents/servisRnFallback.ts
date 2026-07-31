/**
 * Runtime layout za meni `/servis/radninalozi/:sifdv` kad /doclayouts nema (ili je prazan)
 * JSON — ista SP imena kao Ionic `src/pages/servis/RadniNalozi/store`.
 */
import dglEditItemsJson from './fallbackLayouts/servis-radninalozi/dglEditItems.json';
import dglListItemJson from './fallbackLayouts/servis-radninalozi/dglListItem.json';
import dglViewItemsJson from './fallbackLayouts/servis-radninalozi/dglViewItems.json';
import dstEditItemsJson from './fallbackLayouts/servis-radninalozi/dstEditItems.json';
import dstListItemJson from './fallbackLayouts/servis-radninalozi/dstListItem.json';
import propertiesJson from './fallbackLayouts/servis-radninalozi/properties.json';

const SERVIS_RN_SP = 'spMob_DGL_RadniNalozi_Query';
const SERVIS_DST_AZUR_SP = 'spMob_DST_RadniNalozi_Azur';

function unwrapJson<T>(value: T): T {
  if (value && typeof value === 'object' && 'default' in (value as object)) {
    return (value as unknown as { default: T }).default;
  }
  return value;
}

function isEmptyObject(value: unknown): boolean {
  return !value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value as object).length === 0;
}

function isEmptyArray(value: unknown): boolean {
  return !Array.isArray(value) || value.length === 0;
}

function readQuerySp(node: unknown): string | null {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    return null;
  }
  const sp = (node as Record<string, unknown>).sp;
  return typeof sp === 'string' && sp.length > 0 ? sp : null;
}

function ensureQuery(
  group: Record<string, unknown>,
  key: string,
  fallback: { sp: string; params?: Record<string, unknown> },
): boolean {
  if (readQuerySp(group[key])) {
    return false;
  }
  group[key] = fallback;
  return true;
}

/**
 * Dopuni queries + UI za legacy servis RN. Ne dira postojeće ključeve iz /doclayouts.
 */
export function applyServisRnLayoutFallback(raw: Record<string, unknown>): Record<string, unknown> {
  const queriesRaw = raw.queries;
  const queries =
    queriesRaw && typeof queriesRaw === 'object' && !Array.isArray(queriesRaw)
      ? { ...(queriesRaw as Record<string, unknown>) }
      : {};

  const dglRaw = queries.dgl;
  const dgl =
    dglRaw && typeof dglRaw === 'object' && !Array.isArray(dglRaw)
      ? { ...(dglRaw as Record<string, unknown>) }
      : {};

  const dstRaw = queries.dst;
  const dst =
    dstRaw && typeof dstRaw === 'object' && !Array.isArray(dstRaw)
      ? { ...(dstRaw as Record<string, unknown>) }
      : {};

  let changed = false;

  // Ionic filterDefaults → action getDefaults (ne getFilterDefaults).
  changed =
    ensureQuery(dgl, 'list', { sp: SERVIS_RN_SP, params: { action: 'get' } }) || changed;
  changed =
    ensureQuery(dgl, 'filterdefaults', { sp: SERVIS_RN_SP, params: { action: 'getDefaults' } }) ||
    changed;
  changed =
    ensureQuery(dgl, 'statusi', { sp: SERVIS_RN_SP, params: { action: 'getStatusi' } }) || changed;
  changed =
    ensureQuery(dgl, 'prilozi', { sp: SERVIS_RN_SP, params: { action: 'getPrilozi' } }) || changed;

  changed =
    ensureQuery(dst, 'list', { sp: SERVIS_RN_SP, params: { action: 'getDet' } }) || changed;
  changed =
    ensureQuery(dst, 'azur', { sp: SERVIS_DST_AZUR_SP, params: {} }) || changed;
  changed =
    ensureQuery(dst, 'delete', { sp: SERVIS_DST_AZUR_SP, params: {} }) || changed;

  const merged: Record<string, unknown> = {
    ...raw,
    queries: {
      ...queries,
      dgl,
      dst,
    },
  };

  const uiPatches: Record<string, unknown> = {
    dglListItem: unwrapJson(dglListItemJson),
    dglViewItems: unwrapJson(dglViewItemsJson),
    dglEditItems: unwrapJson(dglEditItemsJson),
    dstListItem: unwrapJson(dstListItemJson),
    dstEditItems: unwrapJson(dstEditItemsJson),
    properties: unwrapJson(propertiesJson),
  };

  for (const [key, value] of Object.entries(uiPatches)) {
    const current = merged[key];
    const missing =
      key === 'properties'
        ? isEmptyObject(current)
        : isEmptyArray(current);
    if (missing) {
      merged[key] = value;
      changed = true;
    }
  }

  if (changed && __DEV__) {
    console.info('[documents/servisRnFallback] Primijenjen Ionic servis RN layout fallback');
  }

  return changed ? merged : raw;
}
