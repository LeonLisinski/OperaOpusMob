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

const ZJUKIC_RN_DST_PATCH: LayoutQueryPatch = {
  dst: {
    azur: { sp: 'spMob_ZJUKIC_DST_Azur', params: {} },
    delete: { sp: 'spMob_DST_RadniNalozi_Azur', params: {} },
  },
};

/** Ključ: `{layoutprefix}/{sifdv}` ili `{folder}` — dgl folder može biti `InterRN/{sifgrupe}`. */
const LAYOUT_QUERY_PATCHES: Record<string, LayoutQueryPatch> = {
  'zjukic/RNint': ZJUKIC_RN_DST_PATCH,
  RNint: ZJUKIC_RN_DST_PATCH,
  'zjukic/InterRN': ZJUKIC_RN_DST_PATCH,
  InterRN: ZJUKIC_RN_DST_PATCH,
};

function readQueryNode(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const sp = (raw as Record<string, unknown>).sp;
  return typeof sp === 'string' && sp.length > 0 ? (raw as Record<string, unknown>) : null;
}

function normalizeFolderPath(folder: string): string {
  return folder.replace(/\\/g, '/');
}

function resolvePatchKeys(layoutPrefix: string | null, folder: string, moduleKey?: string): string[] {
  const keys = new Set<string>();
  const normalizedFolder = normalizeFolderPath(folder);
  if (layoutPrefix) {
    keys.add(`${layoutPrefix}/${normalizedFolder}`);
    if (moduleKey) {
      keys.add(`${layoutPrefix}/${normalizeFolderPath(moduleKey)}`);
    }
  }
  keys.add(normalizedFolder);
  if (moduleKey) {
    keys.add(normalizeFolderPath(moduleKey));
  }
  return [...keys];
}

function findQueryPatch(layoutPrefix: string | null, folder: string, moduleKey?: string): LayoutQueryPatch | null {
  for (const key of resolvePatchKeys(layoutPrefix, folder, moduleKey)) {
    const patch = LAYOUT_QUERY_PATCHES[key];
    if (patch) {
      return patch;
    }
  }

  const folderLower = normalizeFolderPath(folder).toLowerCase();
  const moduleLower = moduleKey ? normalizeFolderPath(moduleKey).toLowerCase() : null;

  for (const [key, patch] of Object.entries(LAYOUT_QUERY_PATCHES)) {
    const keyLower = key.toLowerCase();
    if (
      keyLower === folderLower ||
      keyLower === moduleLower ||
      folderLower.startsWith(`${keyLower}/`) ||
      (moduleLower !== null && moduleLower.startsWith(`${keyLower}/`))
    ) {
      return patch;
    }
  }

  return null;
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
  const patch = findQueryPatch(layoutPrefix, folder, moduleKey);
  if (!patch) {
    return raw;
  }

  const merged = applyPatch(raw, patch);
  if (merged) {
    if (__DEV__) {
      console.info(`[documents/layoutQueryPatches] Dopunjen queries.dst za ${normalizeFolderPath(folder)}`);
    }
    return merged;
  }

  return raw;
}
