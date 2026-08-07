import { apiPost } from './client';

const SERIJA_SP = 'spMob_DST_Ser';

/**
 * Pretraga serija uređaja — identičan request oblik kao
 * src/components/search/searchser.tsx getDataDefinition(): hardkod SP
 * `spMob_DST_Ser`, action `get`, filteri sifsklad/sifart (null = bez filtera).
 */
export async function fetchSerijaRows(params: {
  apiBaseUrl: string;
  tenantDb: string;
  sifsklad?: unknown;
  sifart?: unknown;
  search?: string | null;
}): Promise<unknown> {
  return apiPost<unknown>({
    url: `${params.apiBaseUrl}/data`,
    body: {
      db: params.tenantDb,
      queries: [
        {
          query: SERIJA_SP,
          params: {
            action: 'get',
            sifsklad: params.sifsklad ?? null,
            sifart: params.sifart ?? null,
            search: params.search ?? null,
          },
          commandType: 'sp',
        },
      ],
    },
  });
}
