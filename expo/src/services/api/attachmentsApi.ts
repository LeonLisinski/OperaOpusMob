import { apiPost } from './client';

/**
 * Jedna datoteka pripremljena za upload — polja odgovaraju točno onome što Ionic šalje
 * (v. src/pages/dgl/tabs/TabPrivitci.jsx `result.files` iz @capawesome/capacitor-file-picker
 * `PickedFile`: name/mimeType/data(base64)/size). Backend oblik za `/saveatt` nije u ovom
 * repozitoriju (v. .cursor/rules/00-project-context.mdc — API servis nije ovdje), pa se
 * repliciraju točno polja koja postojeća Ionic aplikacija već uspješno šalje.
 */
export interface AttachmentUploadFile {
  name: string;
  mimeType: string;
  data: string;
  size?: number;
}

/**
 * POST /saveatt — ekvivalent src/utils/dataHelper.js saveAttachments. Nije /data SP poziv;
 * tijelo zahtjeva je `{ db, parameters: { dglid, files } }`, bez `queries` omotača.
 */
export async function uploadAttachmentsRequest(params: {
  apiBaseUrl: string;
  tenantDb: string;
  itemId: string | number;
  files: AttachmentUploadFile[];
}): Promise<unknown> {
  return apiPost<unknown>({
    url: `${params.apiBaseUrl}/saveatt`,
    body: {
      db: params.tenantDb,
      parameters: {
        dglid: params.itemId,
        files: params.files,
      },
    },
  });
}

export interface AttachmentDownloadResponse {
  FileName: string;
  Base64String: string;
}

/**
 * POST /getatt — ekvivalent src/utils/dataHelper.js getAttachemnt. Odgovor koristi
 * PascalCase ključeve (`FileName`, `Base64String`) — potvrđeno iz Ionic izvora
 * (src/pages/dgl/tabs/TabPrivitci.jsx onItemClick), ne pretpostavka.
 */
export async function fetchAttachmentRequest(params: {
  apiBaseUrl: string;
  tenantDb: string;
  id: string | number;
}): Promise<AttachmentDownloadResponse> {
  return apiPost<AttachmentDownloadResponse>({
    url: `${params.apiBaseUrl}/getatt`,
    body: { db: params.tenantDb, id: params.id },
  });
}
