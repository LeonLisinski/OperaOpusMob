import { apiPost } from './client';

/**
 * Generički šifrarnik search poziv — identičan request oblik kao
 * src/components/search/simple/search.jsx getDataDefinition(): SP je `spMob_DGL_Sifarnici`
 * osim ako layout ne definira override (`queries.{group}.sifarnici.sp`), `action` je
 * `entity` iz *EditItems.json, `search` je upisani tekst (samo za `advanced` kontrole).
 */
export async function fetchSifarnikRows(params: {
  apiBaseUrl: string;
  tenantDb: string;
  sp: string;
  entity: string;
  korime: string;
  search?: string;
  parentId?: unknown;
  extraParams?: Record<string, unknown>;
}): Promise<unknown> {
  return apiPost<unknown>({
    url: `${params.apiBaseUrl}/data`,
    body: {
      db: params.tenantDb,
      queries: [
        {
          query: params.sp,
          params: {
            action: params.entity,
            korIme: params.korime,
            parentId: params.parentId,
            search: params.search,
            ...params.extraParams,
          },
          commandType: 'sp',
        },
      ],
    },
  });
}
