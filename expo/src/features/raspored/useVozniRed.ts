import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeVozniRedRows } from '@/features/raspored/normalize';
import type { VozniRedRow } from '@/features/raspored/types';
import { fetchVozniRedRequest } from '@/services/api/rasporedApi';
import { extractTenantDatabase } from '@/services/api/responseNormalizers';
import { useAppSelector } from '@/store/hooks';

function resolveSifOsobe(user: Record<string, unknown> | null | undefined): string | null {
  if (!user) return null;
  const raw = user.sifosobe ?? user.SifOsobe;
  if (raw === null || raw === undefined) return null;
  const text = String(raw).trim();
  return text.length > 0 ? text : null;
}

function resolveDriverName(user: Record<string, unknown> | null | undefined): string | null {
  if (!user) return null;
  const raw = user.name ?? user.Name ?? user.korime ?? user.KorIme;
  if (raw === null || raw === undefined) return null;
  const text = String(raw).trim();
  return text.length > 0 ? text : null;
}

function rangeKey(range: { datumOd: string; datumDo: string } | null): string | null {
  if (!range) return null;
  return `${range.datumOd}|${range.datumDo}`;
}

const EMPTY_ROWS: VozniRedRow[] = [];

export function useVozniRed(range: { datumOd: string; datumDo: string } | null) {
  const core = useAppSelector((state) => state.auth.core);
  const connection = useAppSelector((state) => state.auth.connection);
  const user = useAppSelector((state) => state.auth.user);

  const [cache, setCache] = useState<Record<string, VozniRedRow[]>>({});
  const cacheRef = useRef(cache);
  cacheRef.current = cache;

  /** Samo prvo otvaranje ekrana dok još nema nijednog cache unosa. */
  const [initialLoading, setInitialLoading] = useState(false);
  /** Bilo koji fetch u tijeku (tihi ili pull) — za prazan tab bez lažnog „Nema vožnji“. */
  const [fetching, setFetching] = useState(false);
  /** Samo eksplicitni pull-to-refresh. */
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const sifOsobe = resolveSifOsobe(user as Record<string, unknown> | null);
  const driverName = resolveDriverName(user as Record<string, unknown> | null);
  const key = rangeKey(range);
  const rows = key && Object.prototype.hasOwnProperty.call(cache, key) ? cache[key] : EMPTY_ROWS;
  const hasCachedRange = key ? Object.prototype.hasOwnProperty.call(cache, key) : false;

  const load = useCallback(
    async (options?: { pull?: boolean }) => {
      const pull = options?.pull === true;
      if (!range || !key || !core) {
        return;
      }
      if (!sifOsobe) {
        setError('Nedostaje šifra osobe (sifosobe) u ERP sesiji — nije moguće učitati raspored.');
        setCache((prev) => ({ ...prev, [key]: [] }));
        return;
      }

      const snapshot = cacheRef.current;
      const known = Object.prototype.hasOwnProperty.call(snapshot, key);
      const cacheEmpty = Object.keys(snapshot).length === 0;

      if (pull) {
        setPullRefreshing(true);
      } else if (!known && cacheEmpty) {
        setInitialLoading(true);
      }
      // Promjena taba / tjedna: tihi fetch — bez pull spinnera.

      const requestId = ++requestIdRef.current;
      setError(null);
      setFetching(true);
      try {
        const tenantDb = extractTenantDatabase(connection as Record<string, unknown> | undefined, core.db);
        const raw = await fetchVozniRedRequest({
          apiBaseUrl: core.apiBaseUrl,
          tenantDb,
          datumOd: range.datumOd,
          datumDo: range.datumDo,
          sifOsobe,
        });
        if (requestId !== requestIdRef.current) {
          return;
        }
        setCache((prev) => ({ ...prev, [key]: normalizeVozniRedRows(raw) }));
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        const message = err instanceof Error ? err.message : 'Greška pri učitavanju voznog reda.';
        setError(message);
        if (!known) {
          setCache((prev) => ({ ...prev, [key]: [] }));
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setInitialLoading(false);
          setPullRefreshing(false);
          setFetching(false);
        }
      }
    },
    [connection, core, key, range, sifOsobe],
  );

  useEffect(() => {
    if (!key) return;
    void load();
  }, [key, load]);

  const refresh = useCallback(() => load({ pull: true }), [load]);

  return {
    rows,
    /** Prvo otvaranje rasporeda — prazan ekran sa spinnerom. */
    loading: initialLoading && !hasCachedRange,
    /** Tihi fetch raspona koji još nije u cacheu (bez spinnera). */
    awaitingRange: Boolean(key && !hasCachedRange && fetching),
    /** Pull-to-refresh indikator. */
    pullRefreshing,
    error,
    sifOsobe,
    driverName,
    refresh,
  };
}
