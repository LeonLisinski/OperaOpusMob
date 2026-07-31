/**
 * Runtime layout za `/servis/dnevniizvjestaj` — SP kao Ionic DnevniIzvjestaj/store.
 */
import dglEditItemsJson from './fallbackLayouts/servis-dnevniizvjestaj/dglEditItems.json';
import dglEditItemsExtendsJson from './fallbackLayouts/servis-dnevniizvjestaj/dglEditItemsExtends.json';
import dglListItemJson from './fallbackLayouts/servis-dnevniizvjestaj/dglListItem.json';
import dglViewItemsJson from './fallbackLayouts/servis-dnevniizvjestaj/dglViewItems.json';

const DNIZ_SP = 'spMob_DGL_DnevniIzvjestaj_Query';

function unwrapJson<T>(value: T): T {
  if (value && typeof value === 'object' && 'default' in (value as object)) {
    return (value as unknown as { default: T }).default;
  }
  return value;
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

export function applyServisDnizLayoutFallback(raw: Record<string, unknown>): Record<string, unknown> {
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

  let changed = false;
  changed =
    ensureQuery(dgl, 'list', { sp: DNIZ_SP, params: { action: 'getByUser' } }) || changed;
  changed =
    ensureQuery(dgl, 'filterdefaults', { sp: DNIZ_SP, params: { action: 'getDefaults' } }) ||
    changed;

  const merged: Record<string, unknown> = {
    ...raw,
    queries: {
      ...queries,
      dgl,
    },
  };

  const uiPatches: Record<string, unknown> = {
    dglListItem: unwrapJson(dglListItemJson),
    dglViewItems: unwrapJson(dglViewItemsJson),
    dglEditItems: unwrapJson(dglEditItemsJson),
    dglEditItemsExtends: unwrapJson(dglEditItemsExtendsJson),
  };

  for (const [key, value] of Object.entries(uiPatches)) {
    const current = merged[key];
    const missing = Array.isArray(value)
      ? !Array.isArray(current) || current.length === 0
      : !current || (typeof current === 'object' && Object.keys(current as object).length === 0);
    if (missing) {
      merged[key] = value;
      changed = true;
    }
  }

  if (changed && __DEV__) {
    console.info('[documents/servisDnizFallback] Primijenjen Ionic DNIZ layout fallback');
  }

  return changed ? merged : raw;
}
