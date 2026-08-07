import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeObavijestRows } from '@/features/raspored/normalize';
import type { ObavijestRow } from '@/features/raspored/types';
import {
  confirmRasporedObavijestRequest,
  fetchRasporedObavijestListRequest,
} from '@/services/api/rasporedApi';
import { extractTenantDatabase } from '@/services/api/responseNormalizers';
import { useAppSelector } from '@/store/hooks';

function rangeKey(range: { datumOd: string; datumDo: string } | null): string | null {
  if (!range) return null;
  return `${range.datumOd}|${range.datumDo}`;
}

const EMPTY_OBAVIJESTI: ObavijestRow[] = [];

function resolveKorime(user: Record<string, unknown> | null | undefined): string | null {
  if (!user) return null;
  const raw = user.korime ?? user.KorIme ?? user.sifosobe ?? user.SifOsobe;
  if (raw === null || raw === undefined) return null;
  const text = String(raw).trim();
  return text.length > 0 ? text : null;
}

/**
 * Statusi dana za vozača — `spDispRasporedObavijestList`.
 * Cache po rasponu; potvrda (`odgovor` → PRIHVACENO) invalidira i osvježava.
 */
export function useRasporedObavijesti(
  range: { datumOd: string; datumDo: string } | null,
  sifOsobe: string | null,
) {
  const core = useAppSelector((state) => state.auth.core);
  const connection = useAppSelector((state) => state.auth.connection);
  const user = useAppSelector((state) => state.auth.user);

  const [cache, setCache] = useState<Record<string, ObavijestRow[]>>({});
  const cacheRef = useRef(cache);
  cacheRef.current = cache;
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const key = rangeKey(range);
  const rows = key && Object.prototype.hasOwnProperty.call(cache, key) ? cache[key] : EMPTY_OBAVIJESTI;
  const korime = resolveKorime(user as Record<string, unknown> | null);

  const load = useCallback(async () => {
    if (!range || !key || !core || !sifOsobe) {
      return;
    }
    const requestId = ++requestIdRef.current;
    setError(null);
    try {
      const tenantDb = extractTenantDatabase(connection as Record<string, unknown> | undefined, core.db);
      const raw = await fetchRasporedObavijestListRequest({
        apiBaseUrl: core.apiBaseUrl,
        tenantDb,
        datumOd: range.datumOd,
        datumDo: range.datumDo,
        sifOsobe,
      });
      if (requestId !== requestIdRef.current) return;
      setCache((prev) => ({ ...prev, [key]: normalizeObavijestRows(raw) }));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const message = err instanceof Error ? err.message : 'Greška pri učitavanju obavijesti rasporeda.';
      setError(message);
      if (!Object.prototype.hasOwnProperty.call(cacheRef.current, key)) {
        setCache((prev) => ({ ...prev, [key]: [] }));
      }
    }
  }, [connection, core, key, range, sifOsobe]);

  useEffect(() => {
    if (!key || !sifOsobe) return;
    void load();
  }, [key, load, sifOsobe]);

  const confirmDay = useCallback(
    async (datum: string) => {
      if (!core || !sifOsobe || !korime) {
        throw new Error('Nedostaje sesija za potvrdu rasporeda.');
      }
      setConfirming(true);
      setError(null);
      try {
        const tenantDb = extractTenantDatabase(connection as Record<string, unknown> | undefined, core.db);
        await confirmRasporedObavijestRequest({
          apiBaseUrl: core.apiBaseUrl,
          tenantDb,
          sifOsobe,
          datum,
          korisnikId: korime,
        });
        await load();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Potvrda nije uspjela.';
        setError(message);
        throw err;
      } finally {
        setConfirming(false);
      }
    },
    [connection, core, korime, load, sifOsobe],
  );

  const confirmDays = useCallback(
    async (datumi: string[]) => {
      if (datumi.length === 0) return;
      if (!core || !sifOsobe || !korime) {
        throw new Error('Nedostaje sesija za potvrdu rasporeda.');
      }
      setConfirming(true);
      setError(null);
      try {
        const tenantDb = extractTenantDatabase(connection as Record<string, unknown> | undefined, core.db);
        for (const datum of datumi) {
          await confirmRasporedObavijestRequest({
            apiBaseUrl: core.apiBaseUrl,
            tenantDb,
            sifOsobe,
            datum,
            korisnikId: korime,
          });
        }
        await load();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Potvrda nije uspjela.';
        setError(message);
        throw err;
      } finally {
        setConfirming(false);
      }
    },
    [connection, core, korime, load, sifOsobe],
  );

  return {
    rows,
    error,
    confirming,
    refresh: load,
    confirmDay,
    confirmDays,
  };
}
