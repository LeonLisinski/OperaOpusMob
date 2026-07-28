/**
 * Dopuna /doclayouts odgovora kad server nema queries.dst.azur/delete.
 * Ionic te SP-ove hardkodira u store-u; Expo ih čita iz JSON-a (D026).
 * Patch se primjenjuje samo za nedostajuće ključe — produkcijski layout na serveru ima prednost.
 */
type QueryPatch = {
  sp: string;
  params?: Record<string, unknown>;
};

type LayoutQueryPatch = {
  dst?: {
    azur?: QueryPatch;
    delete?: QueryPatch;
  };
};

/** Ključ: `{layoutprefix}/{sifdv}` — dgl folder može biti `RNint/{sifgrupe}`. */
const LAYOUT_QUERY_PATCHES: Record<string, LayoutQueryPatch> = {
  'zjukic/RNint': {
    dst: {
      azur: { sp: 'spMob_ZJUKIC_DST_Azur', params: {} },
      delete: { sp: 'spMob_DST_RadniNalozi_Azur', params: {} },
    },
  },
};

function readQueryNode(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const sp = (raw as Record<string, unknown>).sp;
  return typeof sp === 'string' && sp.length > 0 ? (raw as Record<string, unknown>) : null;
}

function resolvePatchKeys(layoutPrefix: string | null, folder: string, moduleKey?: string): string[] {
  const keys = new Set<string>();
  if (layoutPrefix) {
    keys.add(`${layoutPrefix}/${folder}`);
    if (moduleKey) {
      keys.add(`${layoutPrefix}/${moduleKey}`);
    }
  }
  keys.add(folder);
  if (moduleKey) {
    keys.add(moduleKey);
  }
  return [...keys];
}

function applyPatch(raw: Record<string, unknown>, patch: LayoutQueryPatch): Record<string, unknown> | null {
  if (!patch.dst) {
    return null;
  }

  const queriesRaw = raw.queries;
  const queries =
    queriesRaw && typeof queriesRaw === 'object' && !Array.isArray(queriesRaw)
      ? { ...(queriesRaw as Record<string, unknown>) }
      : {};

  const dstRaw = queries.dst;
  const dst =
    dstRaw && typeof dstRaw === 'object' && !Array.isArray(dstRaw)
      ? { ...(dstRaw as Record<string, unknown>) }
      : {};

  let changed = false;
  const patchDst = patch.dst;

  if (!readQueryNode(dst.azur) && patchDst.azur) {
    dst.azur = patchDst.azur;
    changed = true;
  }
  if (!readQueryNode(dst.delete) && patchDst.delete) {
    dst.delete = patchDst.delete;
    changed = true;
  }

  if (!changed) {
    return null;
  }

  return {
    ...raw,
    queries: {
      ...queries,
      dst,
    },
  };
}

export function overlayMissingLayoutQueries(
  raw: Record<string, unknown>,
  layoutPrefix: string | null,
  folder: string,
  moduleKey?: string,
): Record<string, unknown> {
  for (const key of resolvePatchKeys(layoutPrefix, folder, moduleKey)) {
    const patch = LAYOUT_QUERY_PATCHES[key];
    if (!patch) {
      continue;
    }
    const merged = applyPatch(raw, patch);
    if (merged) {
      if (__DEV__) {
        console.info(`[documents/layoutQueryPatches] Dopunjen queries.dst za ${key}`);
      }
      return merged;
    }
  }
  return raw;
}
