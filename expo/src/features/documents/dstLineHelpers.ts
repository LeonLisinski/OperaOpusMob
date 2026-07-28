import type { StatusTone } from '@/features/documents/statusTone';
import type { ModuleLayout } from '@/features/documents/types';

/**
 * Truthy polje iz API/SQL odgovora — isto ponašanje kao Ionic `item?.cmddelete` / `listItem?.editable`.
 * Eksplicitno tretira 0, '0', 'false' kao false (Boolean('false') u JS je true).
 */
export function isTruthyApiField(value: unknown): boolean {
  if (value === null || value === undefined || value === '' || value === false) {
    return false;
  }
  if (value === 0 || value === '0' || value === 'false' || value === 'False') {
    return false;
  }
  return true;
}

/** Flag stupac stavke (cmddelete, cmdpotvrdakolicine, …) — case-insensitive ključ. */
export function readDstLineFlag(row: Record<string, unknown>, key: string): boolean {
  const lowerKey = key.toLowerCase();
  for (const [field, value] of Object.entries(row)) {
    if (field.toLowerCase() === lowerKey) {
      return isTruthyApiField(value);
    }
  }
  return false;
}

export interface DstLineSwipeActions {
  delete: boolean;
  confirmQty: boolean;
  removeQty: boolean;
  addSub: boolean;
}

/** Koje swipe akcije prikazati — flag iz SP-a + odgovarajući query u layoutu (D026). */
export function dstLineSwipeActions(
  row: Record<string, unknown>,
  layout: ModuleLayout | null,
  layoutHasDstActions: boolean,
): DstLineSwipeActions {
  if (!layout || !layoutHasDstActions) {
    return { delete: false, confirmQty: false, removeQty: false, addSub: false };
  }
  return {
    delete: readDstLineFlag(row, 'cmddelete') && !!layout.dstDeleteQuery,
    confirmQty: readDstLineFlag(row, 'cmdpotvrdakolicine') && !!layout.dstAzurQuery,
    removeQty: readDstLineFlag(row, 'cmddeletepotvrdakolicine') && !!layout.dstAzurQuery,
    addSub: readDstLineFlag(row, 'cmdpodstavke') && !!layout.dstAzurQuery,
  };
}

/** Layout ima SP definicije za swipe/CRUD stavki (queries.dst.azur ili .delete). */
export function layoutHasDstActions(layout: ModuleLayout | null): boolean {
  return !!layout?.dstAzurQuery || !!layout?.dstDeleteQuery;
}

export function dstLineHasSwipeActions(actions: DstLineSwipeActions): boolean {
  return actions.delete || actions.confirmQty || actions.removeQty || actions.addSub;
}

/**
 * Mapiranje Ionic Tab3.css klasa pozadine reda na semantički ton — konkretna nijansa
 * dolazi iz teme (`*Soft`) da red ostane čitljiv i u dark schemeu.
 */
export function toneForIndClass(indclassname: unknown): StatusTone | null {
  if (typeof indclassname !== 'string') {
    return null;
  }
  switch (indclassname) {
    case 'item-background-color':
    case 'item-background-color-green':
      return 'success';
    case 'item-background-color-gray':
      return 'neutral';
    case 'item-background-color-red':
      return 'danger';
    case 'item-background-color-yellow':
      return 'warning';
    default:
      return null;
  }
}

export function isPodstavkaRow(row: Record<string, unknown>): boolean {
  const pod = row.podclassname;
  return typeof pod === 'string' && pod.includes('item-podstavka');
}
