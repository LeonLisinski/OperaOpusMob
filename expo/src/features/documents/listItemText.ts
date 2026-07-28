import { formatDateValue, isEmptyValue } from './format';
import type { ListFieldDef, ListItemLayoutGroup } from './types';

/** Jedno polje retka liste prema *ListItem.json (v. src/pages/dgl/List.jsx getItemValue). */
export function formatListFieldValue(field: ListFieldDef, item: Record<string, unknown>): string | null {
  const value = item[field.field];
  if (isEmptyValue(value)) {
    return null;
  }
  if (field.type === 'date') {
    return formatDateValue(value, field.format);
  }
  return String(value);
}

/** Grupa polja spojena u jednu liniju teksta; `null` kad nijedno polje nema vrijednost. */
export function renderListGroupText(group: ListItemLayoutGroup, item: Record<string, unknown>): string | null {
  const parts = group.fields
    .map((field) => formatListFieldValue(field, item))
    .filter((value): value is string => value !== null);

  return parts.length > 0 ? parts.join('  ') : null;
}

/**
 * Primarni identitet dokumenta (npr. "1-0208-26  17.07.2026") — prva grupa layout definicije
 * liste. Koristi se u kontekstnoj traci unutar dokumenta da korisnik uvijek zna gdje je.
 */
export function documentIdentityText(
  groups: ListItemLayoutGroup[],
  item: Record<string, unknown> | null,
): string | null {
  if (!item || groups.length === 0) {
    return null;
  }
  for (const group of groups) {
    const text = renderListGroupText(group, item);
    if (text) {
      return text;
    }
  }
  return null;
}
