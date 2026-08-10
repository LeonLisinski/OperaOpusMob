import { apiPost } from './client';
import { normalizeDocumentList } from './responseNormalizers';

/**
 * `spMobKorisnikSave` Action=TOKEN — snima Expo/FCM token na MobKorisnik po SifOsobe.
 * Ne zahtijeva MOB login (Disp ugovor: SifOsobe dovoljan).
 */
export async function savePushTokenRequest(params: {
  apiBaseUrl: string;
  tenantDb: string;
  sifOsobe: string;
  pushToken: string;
}): Promise<Record<string, unknown>[]> {
  const raw = await apiPost<unknown>({
    url: `${params.apiBaseUrl}/data`,
    body: {
      db: params.tenantDb,
      queries: [
        {
          query: 'spMobKorisnikSave',
          commandType: 'sp',
          params: {
            Action: 'TOKEN',
            SifOsobe: params.sifOsobe,
            PushToken: params.pushToken,
          },
        },
      ],
    },
  });
  return normalizeDocumentList(raw);
}

/**
 * `spMobKorisnikSave` Action=CLEAR_TOKEN — briše token pri odjavi (best-effort).
 */
export async function clearPushTokenRequest(params: {
  apiBaseUrl: string;
  tenantDb: string;
  sifOsobe: string;
}): Promise<void> {
  await apiPost<unknown>({
    url: `${params.apiBaseUrl}/data`,
    body: {
      db: params.tenantDb,
      queries: [
        {
          query: 'spMobKorisnikSave',
          commandType: 'sp',
          params: {
            Action: 'CLEAR_TOKEN',
            SifOsobe: params.sifOsobe,
          },
        },
      ],
    },
  });
}
