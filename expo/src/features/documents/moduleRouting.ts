import type { ModuleMenuEntry } from '@/features/core/types';

import type { ModuleRoute } from './types';

const DGL_URL_PATTERN = /^\/docs\/dgl\/([^/]+)/i;
const GEN_URL_PATTERN = /^\/gen\/list\/([^/]+)\/([^/]+)/i;

/**
 * Parsira module.url (spMob_Menu_Query) prema poznatim Ionic rutama (src/AppMain.tsx:186,189)
 * i vraća sve što treba za dohvat layouta/liste. Vraća null za module tipove izvan
 * opsega ove vertikale (servis/*, push, itd.) — poziva se sigurno prikazuje kao nepodržano.
 */
export function resolveModuleRoute(module: ModuleMenuEntry, sifgrupe: string | number | undefined): ModuleRoute | null {
  const url = typeof module.url === 'string' ? module.url : '';

  const dglMatch = DGL_URL_PATTERN.exec(url.trim().replace(/\/+$/, ''));
  if (dglMatch) {
    const sifdv = dglMatch[1];
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
    };
  }

  const normalizedUrl = url.trim().replace(/\/+$/, '');
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

/** Gradi dgl rutu iz sifdv (npr. nakon CRM Akcije → otvori RN) — isti obrazac kao resolveModuleRoute. */
export function buildDglModuleRoute(sifdv: string, sifgrupe: string | number | undefined): ModuleRoute {
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
  };
}
