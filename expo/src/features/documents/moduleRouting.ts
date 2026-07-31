import type { ModuleMenuEntry } from '@/features/core/types';

import type { ModuleRoute } from './types';

const DGL_URL_PATTERN = /^\/docs\/dgl\/([^/]+)/i;
const GEN_URL_PATTERN = /^\/gen\/list\/([^/]+)\/([^/]+)/i;
/** Ionic AppMain `/servis/radninalozi/:sifdv` — legacy hardkod vertikala (MIDA i sl.). */
const SERVIS_RN_URL_PATTERN = /^\/servis\/radninalozi\/([^/]+)/i;
const SERVIS_DNIZ_URL_PATTERN = /^\/servis\/dnevniizvjestaj$/i;

function buildDglRoute(
  sifdv: string,
  sifgrupe: string | number | undefined,
  layoutSource?: ModuleRoute['layoutSource'],
): ModuleRoute {
  const group = sifgrupe !== undefined && sifgrupe !== null ? String(sifgrupe) : '';
  return {
    kind: 'dgl',
    folder: group ? `${sifdv}/${group}` : sifdv,
    fallbackFolder: group ? sifdv : undefined,
    listItemKey: 'dglListItem',
    viewItemsKey: 'dglViewItems',
    editItemsKey: 'dglEditItems',
    editItemsExtendsKey: 'dglEditItemsExtends',
    queryGroupKey: 'dgl',
    idField: 'dglid',
    sifdv,
    ...(layoutSource ? { layoutSource } : {}),
  };
}

/**
 * Parsira module.url (spMob_Menu_Query) prema poznatim Ionic rutama (src/AppMain.tsx)
 * i vraća sve što treba za dohvat layouta/liste. Vraća null za tipove izvan opsega (push…).
 */
export function resolveModuleRoute(module: ModuleMenuEntry, sifgrupe: string | number | undefined): ModuleRoute | null {
  const url = typeof module.url === 'string' ? module.url : '';
  const normalizedUrl = url.trim().replace(/\/+$/, '');

  const dglMatch = DGL_URL_PATTERN.exec(normalizedUrl);
  if (dglMatch) {
    return buildDglRoute(dglMatch[1], sifgrupe);
  }

  const servisRnMatch = SERVIS_RN_URL_PATTERN.exec(normalizedUrl);
  if (servisRnMatch) {
    return buildDglRoute(servisRnMatch[1], sifgrupe, 'servis-rn');
  }

  if (SERVIS_DNIZ_URL_PATTERN.test(normalizedUrl)) {
    // DNIZ nema sifgrupe folder u Ionicu — fiksan sifdv.
    return buildDglRoute('DNIZ', undefined, 'servis-dniz');
  }

  const genMatch = GEN_URL_PATTERN.exec(normalizedUrl);
  if (genMatch) {
    const [, app, mod] = genMatch;
    return {
      kind: 'gen',
      folder: `${app}/${mod}`,
      listItemKey: 'glaListItem',
      viewItemsKey: 'glaViewItems',
      editItemsKey: 'glaEditItems',
      editItemsExtendsKey: 'glaEditItemsExtends',
      queryGroupKey: 'gla',
      idField: 'id',
      app,
      module: mod,
    };
  }

  return null;
}

/** Gradi dgl rutu iz sifdv (npr. nakon CRM Akcije → otvori RN). */
export function buildDglModuleRoute(sifdv: string, sifgrupe: string | number | undefined): ModuleRoute {
  return buildDglRoute(sifdv, sifgrupe);
}
