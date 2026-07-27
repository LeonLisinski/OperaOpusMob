import { apiPost } from './client';

/**
 * Odgovor spMob_Menu_Query: table1 = aplikacije, table2 = moduli — potvrđeno u
 * BaseSqlRepository.cs (PopulateJsonData kad ima više result setova) i Ionic
 * core/cc/store/index.jsx getMenu.fulfilled.
 */
export interface MenuRawResponse {
  table1?: Record<string, unknown>[];
  table2?: Record<string, unknown>[];
}

/**
 * Dohvat menija — identičan request oblik kao core/cc/store/index.jsx:4-16
 * (getMenu thunk) preko getData(): db dolazi iz connection.database (ne iz
 * core.db!), vidi dataHelper.js:29. Endpoint je tenant auth.api (auth.serverpath).
 */
export async function fetchMenuRequest(params: { apiBaseUrl: string; tenantDb: string; korime: string }): Promise<MenuRawResponse> {
  return apiPost<MenuRawResponse>({
    url: `${params.apiBaseUrl}/data`,
    body: {
      db: params.tenantDb,
      queries: [
        {
          query: 'spMob_Menu_Query',
          params: {
            action: 'get',
            korIme: params.korime,
          },
          commandType: 'sp',
        },
      ],
    },
  });
}
