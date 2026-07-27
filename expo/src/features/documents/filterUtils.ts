import type { DocumentFilter, StatusFilterItem } from './types';

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
  const today = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 100);
  return {
    datumod: toIso(from),
    datumdo: toIso(today),
    samomoje: true,
    statuses: [],
  };
}

function toIso(date: Date): string {
  const pad = (value: number) => (value < 10 ? `0${value}` : String(value));
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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
  const formatHr = (iso: string) => {
    const [year, month, day] = iso.split('-');
    return `${day}.${month}.${year}.`;
  };
  const statusesText = filter.statuses
    .filter((item) => item.checked)
    .map((item) => item.name)
    .join(', ');
  return {
    line1: `Datum od: ${formatHr(filter.datumod)} Datum do: ${formatHr(filter.datumdo)}`,
    line2: `Statusi: ${statusesText.toLowerCase()}${filter.samomoje ? '; Samo moje stavke' : ''}`,
  };
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
