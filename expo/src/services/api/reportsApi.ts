import { apiPost } from './client';

export interface GenerateReportResponse {
  FileName: string;
  Base64String: string;
}

/**
 * POST /repxreport — ekvivalent src/utils/dataHelper.js getReport.
 * `db` mora biti Core PIN baza (`auth.db` / `core.db`), NE connection.database —
 * Ionic getReport šalje auth.db; /data koristi connection.database.
 * `type: 'mobile'` je jedina vrijednost koju frontend šalje (Tab4.jsx).
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
