import { apiPost } from './client';
import { normalizeDocumentList } from './responseNormalizers';

/**
 * `spDispVozniRed` — ugovor od Disp kolege / Faza 1 Raspored.
 * Body oblik kao ostali tenant `/data` pozivi (`commandType: 'sp'`).
 */
export async function fetchVozniRedRequest(params: {
  apiBaseUrl: string;
  tenantDb: string;
  datumOd: string;
  datumDo: string;
  sifOsobe: string;
}): Promise<Record<string, unknown>[]> {
  const raw = await apiPost<unknown>({
    url: `${params.apiBaseUrl}/data`,
    body: {
      db: params.tenantDb,
      queries: [
        {
          query: 'spDispVozniRed',
          commandType: 'sp',
          params: {
            DatumOd: params.datumOd,
            DatumDo: params.datumDo,
            SifOsobe: params.sifOsobe,
          },
        },
      ],
    },
  });
  return normalizeDocumentList(raw);
}

/**
 * `spDispRasporedObavijestList` — statusi dana × vozač (POSLANO / PRIHVACENO / ODBIJENO).
 */
export async function fetchRasporedObavijestListRequest(params: {
  apiBaseUrl: string;
  tenantDb: string;
  datumOd: string;
  datumDo: string;
  sifOsobe: string;
}): Promise<Record<string, unknown>[]> {
  const raw = await apiPost<unknown>({
    url: `${params.apiBaseUrl}/data`,
    body: {
      db: params.tenantDb,
      queries: [
        {
          query: 'spDispRasporedObavijestList',
          commandType: 'sp',
          params: {
            DatumOd: params.datumOd,
            DatumDo: params.datumDo,
            SifOsobe: params.sifOsobe,
          },
        },
      ],
    },
  });
  return normalizeDocumentList(raw);
}

/**
 * `spDispRasporedObavijestSave` Action=odgovor — mobilna potvrda dana (Josip: samo PRIHVACENO).
 */
export async function confirmRasporedObavijestRequest(params: {
  apiBaseUrl: string;
  tenantDb: string;
  sifOsobe: string;
  datum: string;
  korisnikId: string;
}): Promise<Record<string, unknown>[]> {
  const raw = await apiPost<unknown>({
    url: `${params.apiBaseUrl}/data`,
    body: {
      db: params.tenantDb,
      queries: [
        {
          query: 'spDispRasporedObavijestSave',
          commandType: 'sp',
          params: {
            Action: 'odgovor',
            SifOsobe: params.sifOsobe,
            Datum: params.datum,
            Status: 'PRIHVACENO',
            KorisnikId: params.korisnikId,
          },
        },
      ],
    },
  });
  return normalizeDocumentList(raw);
}
