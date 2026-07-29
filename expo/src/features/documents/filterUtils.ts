import type { DocumentFilter, StatusFilterItem } from './types';
import { daysAgoIso, formatDisplayDate, todayIso } from './format';

/** Zamjena dijakritike — ista logika kao dgl/gen store setSearchText. */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/š/g, 's')
    .replace(/đ/g, 'd')
    .replace(/ž/g, 'z');
}

export function filterListBySearch(
  rows: Record<string, unknown>[],
  query: string,
  searchFields: string[],
): Record<string, unknown>[] {
  const normalizedQuery = normalizeSearchText(query.trim());
  if (!normalizedQuery) {
    return rows;
  }

  return rows.filter((row) =>
    searchFields.some((field) => {
      const key = field.toLowerCase();
      const raw = row[key] ?? row[field];
      if (raw === null || raw === undefined) {
        return false;
      }
      return normalizeSearchText(String(raw)).includes(normalizedQuery);
    }),
  );
}

export function parseSearchFields(raw: unknown): string[] {
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string');
      }
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

export function createDefaultFilter(): DocumentFilter {
  return {
    datumod: daysAgoIso(100),
    datumdo: todayIso(),
    samomoje: true,
    statuses: [],
  };
}

export function cloneFilter(filter: DocumentFilter): DocumentFilter {
  return {
    ...filter,
    statuses: filter.statuses.map((item) => ({ ...item })),
  };
}

export function countActiveFilters(filter: DocumentFilter, baseline: DocumentFilter): number {
  let count = 0;
  if (filter.datumod !== baseline.datumod || filter.datumdo !== baseline.datumdo) {
    count += 1;
  }
  if (filter.samomoje !== baseline.samomoje) {
    count += 1;
  }
  const baselineChecked = new Set(
    baseline.statuses.filter((item) => item.checked).map((item) => String(item.id)),
  );
  const currentChecked = filter.statuses.filter((item) => item.checked).map((item) => String(item.id));
  const statusChanged =
    baselineChecked.size !== currentChecked.length ||
    currentChecked.some((id) => !baselineChecked.has(id));
  if (statusChanged) {
    count += 1;
  }
  return count;
}

export function buildFilterSummary(filter: DocumentFilter): { line1: string; line2: string } {
  const formatHr = (iso: string) => formatDisplayDate(iso) ?? iso;
  const statusesText = filter.statuses
    .filter((item) => item.checked)
    .map((item) => item.name)
    .join(', ');
  return {
    line1: `Datum od: ${formatHr(filter.datumod)} Datum do: ${formatHr(filter.datumdo)}`,
    line2: `Statusi: ${statusesText.toLowerCase()}${filter.samomoje ? '; Samo moje stavke' : ''}`,
  };
}

export type FilterChip = { id: string; label: string; icon: 'calendar-outline' | 'pricetag-outline' | 'person-outline' };

/**
 * Aktivni filter kao niz chipova — zamjena za višelinijski tekstualni sažetak koji je
 * zauzimao visinu iznad liste. Statusi se skraćuju da red ostane čitljiv.
 */
export function buildFilterChips(filter: DocumentFilter): FilterChip[] {
  const formatShort = (iso: string) => {
    const display = formatDisplayDate(iso);
    if (!display) {
      return iso;
    }
    const [day, month] = display.split('.');
    return `${day}.${month}.`;
  };
  const [year] = filter.datumdo.split('-');

  const chips: FilterChip[] = [
    {
      id: 'period',
      icon: 'calendar-outline',
      label: `${formatShort(filter.datumod)} – ${formatShort(filter.datumdo)}${year}.`,
    },
  ];

  const checkedStatuses = filter.statuses.filter((item) => item.checked);
  if (checkedStatuses.length > 0) {
    const shown = checkedStatuses.slice(0, 2).map((item) => item.name).join(', ');
    const rest = checkedStatuses.length - Math.min(2, checkedStatuses.length);
    chips.push({
      id: 'statuses',
      icon: 'pricetag-outline',
      label: rest > 0 ? `${shown} +${rest}` : shown,
    });
  }

  if (filter.samomoje) {
    chips.push({ id: 'samomoje', icon: 'person-outline', label: 'Samo moje' });
  }

  return chips;
}

export function mergeStatusesWithDefaults(
  statuses: StatusFilterItem[],
  statusiChecked: string | null | undefined,
): StatusFilterItem[] {
  const checkedIds = new Set(
    (statusiChecked ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );
  return statuses.map((item) => ({
    ...item,
    checked: checkedIds.has(String(item.id)),
  }));
}

export function buildListRequestParams(
  filter: DocumentFilter,
  korime: string,
  staticParams: Record<string, unknown> | undefined,
  sifdv?: string,
): Record<string, unknown> {
  const statusi = filter.statuses
    .filter((item) => item.checked)
    .map((item) => item.id)
    .join(',');

  const params: Record<string, unknown> = {
    ...staticParams,
    korime,
    datumod: filter.datumod,
    datumdo: filter.datumdo,
    samomoje: filter.samomoje,
    statusi,
  };
  if (sifdv) {
    params.sifdv = sifdv;
  }
  return params;
}
