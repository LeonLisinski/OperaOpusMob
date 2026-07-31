import glaEditItemsJson from './fallbackLayouts/zjukic-crm-upiti/glaEditItems.json';
import glaEditItemsExtendsJson from './fallbackLayouts/zjukic-crm-upiti/glaEditItemsExtends.json';
import glaListItemJson from './fallbackLayouts/zjukic-crm-upiti/glaListItem.json';
import glaViewItemsJson from './fallbackLayouts/zjukic-crm-upiti/glaViewItems.json';

import type { ModuleRoute } from './types';

type LayoutContentPatch = Partial<Record<string, unknown>>;

/** Metro ponekad wrapa JSON u `{ default: ... }` — uvijek izvuci stvarni payload. */
function unwrapJson<T>(value: T): T {
  if (value && typeof value === 'object' && 'default' in (value as object)) {
    return (value as unknown as { default: T }).default;
  }
  return value;
}

const CRM_UPITI_FALLBACK: LayoutContentPatch = {
  glaListItem: unwrapJson(glaListItemJson),
  glaEditItems: unwrapJson(glaEditItemsJson),
  glaViewItems: unwrapJson(glaViewItemsJson),
  glaEditItemsExtends: unwrapJson(glaEditItemsExtendsJson),
};

/** Ključ: `{layoutprefix}/{folder}` ili `{folder}` — dopuna kad /doclayouts nema UI JSON. */
const LAYOUT_CONTENT_PATCHES: Record<string, LayoutContentPatch> = {
  'zjukic/CRM/Upiti': CRM_UPITI_FALLBACK,
  'CRM/Upiti': CRM_UPITI_FALLBACK,
};

function normalizeFolderPath(folder: string): string {
  return folder.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
}

function isCrmUpitiFolder(folder: string): boolean {
  const normalized = normalizeFolderPath(folder).toLowerCase();
  return normalized === 'crm/upiti' || normalized.endsWith('/crm/upiti');
}

function resolvePatchKeys(layoutPrefix: string | null, folder: string, moduleKey?: string): string[] {
  const keys = new Set<string>();
  const normalizedFolder = normalizeFolderPath(folder);
  const normalizedPrefix = layoutPrefix ? normalizeFolderPath(layoutPrefix) : null;

  if (normalizedPrefix) {
    keys.add(`${normalizedPrefix}/${normalizedFolder}`);
    if (moduleKey) {
      keys.add(`${normalizedPrefix}/${normalizeFolderPath(moduleKey)}`);
    }
  }
  keys.add(normalizedFolder);
  if (moduleKey) {
    keys.add(normalizeFolderPath(moduleKey));
  }
  return [...keys];
}

function findContentPatch(layoutPrefix: string | null, folder: string, moduleKey?: string): LayoutContentPatch | null {
  for (const key of resolvePatchKeys(layoutPrefix, folder, moduleKey)) {
    const patch = LAYOUT_CONTENT_PATCHES[key];
    if (patch) {
      return patch;
    }
  }

  const folderLower = normalizeFolderPath(folder).toLowerCase();
  for (const [key, patch] of Object.entries(LAYOUT_CONTENT_PATCHES)) {
    const keyLower = key.toLowerCase();
    if (keyLower === folderLower || keyLower.endsWith(`/${folderLower}`) || folderLower.endsWith(`/${keyLower}`)) {
      return patch;
    }
  }

  // CRM/Upiti — pouzdan match bez ovisnosti o layoutprefixu / casingu
  if (isCrmUpitiFolder(folder) || (moduleKey ? isCrmUpitiFolder(moduleKey) : false)) {
    return CRM_UPITI_FALLBACK;
  }

  return null;
}

function expectsLayoutArray(fieldKey: string): boolean {
  return /ListItem|EditItems|ViewItems/i.test(fieldKey);
}

function isLayoutArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function isMissingLayoutField(value: unknown, fieldKey: string): boolean {
  if (expectsLayoutArray(fieldKey)) {
    return !isLayoutArray(value);
  }
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value as Record<string, unknown>).length === 0;
  }
  return false;
}

function applyLayoutPatch(record: Record<string, unknown>, patch: LayoutContentPatch): Record<string, unknown> {
  let changed = false;
  const merged = { ...record };

  for (const [patchKey, patchValue] of Object.entries(patch)) {
    const value = unwrapJson(patchValue);
    if (value === undefined) {
      if (__DEV__) {
        console.warn(`[documents/layoutContentPatches] Patch vrijednost za ${patchKey} je undefined — provjeri JSON import.`);
      }
      continue;
    }
    if (isMissingLayoutField(merged[patchKey], patchKey)) {
      merged[patchKey] = value;
      changed = true;
    }
  }

  return changed ? merged : record;
}

/**
 * Zadnja linija obrane — primjenjuje se u normalizeModuleLayout kad /doclayouts nema UI JSON.
 * Ne ovisi o layoutprefixu jer se folder gen modula (npr. CRM/Upiti) pouzdano zna iz rute.
 */
export function mergeRouteLayoutFallback(record: Record<string, unknown>, route: ModuleRoute): Record<string, unknown> {
  if (route.kind !== 'gen') {
    return record;
  }

  const folder = normalizeFolderPath(route.folder);
  const patch = findContentPatch(null, folder, folder);
  if (!patch) {
    return record;
  }

  const merged = applyLayoutPatch(record, patch);
  if (merged !== record && __DEV__) {
    console.info(`[documents/layoutContentPatches] mergeRouteLayoutFallback za ${folder}`, {
      glaListItem: Array.isArray(merged.glaListItem) ? (merged.glaListItem as unknown[]).length : typeof merged.glaListItem,
      glaEditItems: Array.isArray(merged.glaEditItems) ? (merged.glaEditItems as unknown[]).length : typeof merged.glaEditItems,
    });
  }
  return merged;
}

/**
 * Dopuna /doclayouts odgovora prije normalizacije (slice sloj).
 */
export function overlayMissingLayoutContent(
  raw: Record<string, unknown>,
  layoutPrefix: string | null,
  folder: string,
  moduleKey?: string,
): Record<string, unknown> {
  const normalizedFolder = normalizeFolderPath(folder);
  const patch = findContentPatch(layoutPrefix, normalizedFolder, moduleKey ? normalizeFolderPath(moduleKey) : undefined);
  if (!patch) {
    if (__DEV__ && (isCrmUpitiFolder(normalizedFolder) || (moduleKey ? isCrmUpitiFolder(moduleKey) : false))) {
      console.warn('[documents/layoutContentPatches] CRM/Upiti patch nije pronađen — neočekivano.', {
        layoutPrefix,
        folder: normalizedFolder,
        moduleKey,
      });
    }
    return raw;
  }

  const merged = applyLayoutPatch(raw, patch);
  if (__DEV__) {
    const listOk = isLayoutArray(merged.glaListItem);
    const editOk = isLayoutArray(merged.glaEditItems);
    if (!listOk || !editOk) {
      console.warn('[documents/layoutContentPatches] Nakon patcha i dalje nedostaje UI layout.', {
        folder: normalizedFolder,
        layoutPrefix,
        keys: Object.keys(merged),
        glaListItem: merged.glaListItem,
        glaEditItems: merged.glaEditItems,
        patchListLen: Array.isArray(patch.glaListItem) ? (patch.glaListItem as unknown[]).length : typeof patch.glaListItem,
        patchEditLen: Array.isArray(patch.glaEditItems) ? (patch.glaEditItems as unknown[]).length : typeof patch.glaEditItems,
      });
    } else if (merged !== raw) {
      console.info(`[documents/layoutContentPatches] Dopunjen UI layout za ${normalizedFolder}`);
    }
  }
  return merged;
}
