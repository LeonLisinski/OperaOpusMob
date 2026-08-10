import { useEffect, useRef } from 'react';

import { registerPushForSifOsobe } from '@/features/push/registerPush';
import { extractTenantDatabase } from '@/services/api/responseNormalizers';
import { useAppSelector } from '@/store/hooks';

function resolveSifOsobe(user: Record<string, unknown> | null | undefined): string | null {
  if (!user) return null;
  const raw = user.sifosobe ?? user.SifOsobe;
  if (raw == null) return null;
  const value = String(raw).trim();
  return value.length > 0 ? value : null;
}

/**
 * Pri ulasku u Raspored snimi Expo push token na MobKorisnik (ERP sifosobe).
 * Jednom po mount sesiji sifosobe+api; tihi fail.
 */
export function useRegisterRasporedPush(enabled: boolean): void {
  const core = useAppSelector((state) => state.auth.core);
  const user = useAppSelector((state) => state.auth.user);
  const connection = useAppSelector((state) => state.auth.connection);
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!core?.apiBaseUrl) return;

    const sifOsobe = resolveSifOsobe(user as Record<string, unknown> | null);
    if (!sifOsobe) return;

    const tenantDb = extractTenantDatabase(
      connection as Record<string, unknown> | null,
      core.db,
    );
    const key = `${core.apiBaseUrl}|${tenantDb}|${sifOsobe}`;
    if (lastKey.current === key) return;
    lastKey.current = key;

    void registerPushForSifOsobe({
      apiBaseUrl: core.apiBaseUrl,
      tenantDb,
      sifOsobe,
    });
  }, [enabled, core, user, connection]);
}
