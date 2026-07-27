import { apiPost } from './client';

export interface GenerateReportResponse {
  FileName: string;
  Base64String: string;
}

/**
 * POST /repxreport — ekvivalent src/utils/dataHelper.js getReport. `type: 'mobile'` je
 * jedina vrijednost koju frontend ikad šalje (v. src/pages/dgl/tabs/Tab4.jsx). Ovo NIJE
 * /data SP poziv — tijelo zahtjeva ima ravnu strukturu s `reportname`/`mailTo`/... poljima.
 */
export async function generateReportRequest(params: {
  apiBaseUrl: string;
  tenantDb: string;
  reportName: string;
  parameters: Record<string, unknown>;
  mailTo?: string;
  mailSubject?: string;
  mailBody?: string;
}): Promise<GenerateReportResponse> {
  return apiPost<GenerateReportResponse>({
    url: `${params.apiBaseUrl}/repxreport`,
    body: {
      db: params.tenantDb,
      reportname: params.reportName,
      parameters: params.parameters,
      mailTo: params.mailTo,
      mailSubject: params.mailSubject,
      mailBody: params.mailBody,
      type: 'mobile',
    },
  });
}
