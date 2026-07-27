import { apiPost } from './client';

/**
 * Generički poziv liste dokumenata — identičan request oblik kao dgl/gen
 * store `getList` thunkovi preko getData() (query+params+commandType='sp' na /data,
 * db = ERP connection.database). Odgovor je bez `tablename`/`singlerow`, pa API
 * (TableHelper.RemoveDataTableColums) vraća goli JSON niz na root razini.
 */
export async function fetchDocumentListRequest(params: {
  apiBaseUrl: string;
  tenantDb: string;
  sp: string;
  params: Record<string, unknown>;
}): Promise<unknown> {
  return apiPost<unknown>({
    url: `${params.apiBaseUrl}/data`,
    body: {
      db: params.tenantDb,
      queries: [
        {
          query: params.sp,
          params: params.params,
          commandType: 'sp',
        },
      ],
    },
  });
}
