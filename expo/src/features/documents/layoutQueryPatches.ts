/**
 * Dopuna /doclayouts odgovora kad server nema queries.dst.azur/delete.
 * Ionic dgl/store hardkodira SP-ove (spMob_ZJUKIC_DST_Azur, spMob_DST_RadniNalozi_Azur)
 * bez obzira na JSON — Expo patch-ira iz poznatih mapa i iz queries.dst.list SP imena.
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

/** Ionic dgl/store deleteDst — fiksni SP za brisanje stavke (Tab3.jsx). */
const IONIC_DST_DELETE_SP = 'spMob_DST_RadniNalozi_Azur';

/**
 * Ionic dgl/store saveDoc hardkodira `spMob_ZJUKIC_DST_Azur` za sve dgl tenante.
 * Konvencija `*_DST_Query` → `*_DST_Azur` vrijedi samo ako je Azur SP stvarno deployan.
 * Dokaz (API `sys.procedures`, 2026-08-11):
 * - Jasika prod `ooJASIKA_20250606_MOB`: ima `spMob_JASIKA_DST_Query` + `spMob_ZJUKIC_DST_Azur`,
 *   NEMA `spMob_JASIKA_DST_Azur` → derive bi pao; Ionic radi zbog hardkoda.
 * - MEDIVA `ooMEDIVA_20260305`: isto — `spMob_MEDIVA_DST_Query`, nema `*_MEDIVA_DST_Azur`.
 * Override mapira list SP → stvarni Azur (Ionic paritet), ne if po imenu klijenta u UI-u.
 */
const DST_LIST_SP_AZUR_OVERRIDES: Record<string, string> = {
  spmob_jasika_dst_query: 'spMob_ZJUKIC_DST_Azur',
  spmob_mediva_dst_query: 'spMob_ZJUKIC_DST_Azur',
};

const ZJUKIC_RN_DST_PATCH: LayoutQueryPatch = {
  dst: {
    azur: { sp: 'spMob_ZJUKIC_DST_Azur', params: {} },
    delete: { sp: IONIC_DST_DELETE_SP, params: {} },
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

function readListSp(raw: Record<string, unknown>): string | null {
  const queries = raw.queries;
  if (!queries || typeof queries !== 'object' || Array.isArray(queries)) {
    return null;
  }
  const dst = (queries as Record<string, unknown>).dst;
  if (!dst || typeof dst !== 'object' || Array.isArray(dst)) {
    return null;
  }
  const listNode = readQueryNode((dst as Record<string, unknown>).list);
  const sp = listNode?.sp;
  return typeof sp === 'string' && sp.length > 0 ? sp : null;
}

/**
 * Iz queries.dst.list SP imena izvedi azur/delete — isti obrazac imenovanja kao u MobLayoutsControls
 * (npr. spMob_ZJUKIC_DST_Query → spMob_ZJUKIC_DST_Azur). Delete prati Ionic Tab3 (RadniNalozi Azur).
 * Ako tenant nema `*_DST_Azur` pod konvencijom, v. DST_LIST_SP_AZUR_OVERRIDES (Ionic hardkod).
 */
function deriveDstPatchFromListSp(listSp: string): LayoutQueryPatch | null {
  const patch: LayoutQueryPatch = { dst: {} };

  const overrideAzur = DST_LIST_SP_AZUR_OVERRIDES[listSp.trim().toLowerCase()];
  if (overrideAzur) {
    patch.dst!.azur = { sp: overrideAzur, params: {} };
  } else if (/_Query$/i.test(listSp)) {
    patch.dst!.azur = { sp: listSp.replace(/_Query$/i, '_Azur'), params: {} };
  }

  if (/_DST_/i.test(listSp)) {
    patch.dst!.delete = { sp: IONIC_DST_DELETE_SP, params: {} };
  }

  if (!patch.dst!.azur && !patch.dst!.delete) {
    return null;
  }

  return patch;
}

function deriveDstPatchFromLayout(raw: Record<string, unknown>): LayoutQueryPatch | null {
  const listSp = readListSp(raw);
  if (!listSp) {
    return null;
  }
  return deriveDstPatchFromListSp(listSp);
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

function findStaticQueryPatch(layoutPrefix: string | null, folder: string, moduleKey?: string): LayoutQueryPatch | null {
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
  let result = raw;

  const staticPatch = findStaticQueryPatch(layoutPrefix, folder, moduleKey);
  if (staticPatch) {
    const merged = applyPatch(result, staticPatch);
    if (merged) {
      result = merged;
    }
  }

  const derivedPatch = deriveDstPatchFromLayout(result);
  if (derivedPatch) {
    const merged = applyPatch(result, derivedPatch);
    if (merged) {
      if (__DEV__) {
        console.info(
          `[documents/layoutQueryPatches] Dopunjen queries.dst (derive) za ${normalizeFolderPath(folder)}`,
        );
      }
      result = merged;
    }
  }

  return result;
}
