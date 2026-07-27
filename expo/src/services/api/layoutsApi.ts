import { apiPost } from './client';

/**
 * Dohvat JSON layouta za jedan folder — identičan request oblik kao
 * dataHelper.js getDocsDefinitions(): POST {api}/doclayouts { folder }.
 * Ako je odgovor prazan objekt, pokušava ponovno bez tenant prefiksa
 * (isti dvostruki fallback kao u Ionicu). `/doclayouts` nije implementiran u
 * referentnom `API/` snapshotu — ugovor je potvrđen iz klijenta (v. OPEN_QUESTIONS.md #3).
 */
async function fetchLayoutFolder(apiBaseUrl: string, folder: string, layoutPrefix: string | null): Promise<Record<string, unknown>> {
  const prefixedFolder = layoutPrefix ? `${layoutPrefix}/${folder}` : folder;

  let data = await apiPost<Record<string, unknown>>({
    url: `${apiBaseUrl}/doclayouts`,
    body: { folder: prefixedFolder },
  });

  if ((!data || Object.keys(data).length === 0) && prefixedFolder !== folder) {
    data = await apiPost<Record<string, unknown>>({
      url: `${apiBaseUrl}/doclayouts`,
      body: { folder },
    });
  }

  return data ?? {};
}

/**
 * Dohvat layouta za modul, s dodatnim fallbackom sifdv/sifgrupe → sifdv (samo dgl,
 * v. docsSlice.getDocsLayout). `fallbackFolder` je undefined za gen module.
 */
export async function fetchModuleLayout(params: {
  apiBaseUrl: string;
  layoutPrefix: string | null;
  folder: string;
  fallbackFolder?: string;
}): Promise<Record<string, unknown>> {
  let data = await fetchLayoutFolder(params.apiBaseUrl, params.folder, params.layoutPrefix);

  if (Object.keys(data).length === 0 && params.fallbackFolder) {
    data = await fetchLayoutFolder(params.apiBaseUrl, params.fallbackFolder, params.layoutPrefix);
  }

  return data;
}
