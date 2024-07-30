import {SERVICE_DOMAIN, SERVICE_CORE_DOMAIN} from './../../constants';

//**generic (main) endpoint
export const SERVICE_ENDPOINT = `${SERVICE_DOMAIN}/data`;
export const SERVICE_CORE_ENDPOINT = `${SERVICE_CORE_DOMAIN}/data`;

//**printing endpoint (test)
export const SERVICE_PRINT_ENDPOINT = `${SERVICE_DOMAIN}/gridToPdf`;

//**helpers endpoint
export const SERVICE_FILE_ENDPOINT = `${SERVICE_DOMAIN}/base64frompath`;
export const SERVICE_PATH_EXISTS = `${SERVICE_DOMAIN}/pathexists`;
export const SERVICE_DECRIPTOR_ENDPOINT = `${SERVICE_DOMAIN}/rndcrypt`;
export const SERVICE_LAYOUT_ENDPOINT = `${SERVICE_DOMAIN}/layouts`
//**repx endpoint
export const SERVICE_DOCSLAYOUT_ENDPOINT = `${SERVICE_DOMAIN}/docslayouts`;

//**mail endpoint
export const SERVICE_MAIL_ZAMJENA_ENDPOINT = `${SERVICE_DOMAIN}/fieldstovalues`;
export const SERVICE_MAIL_SEND_ENDPOINT = `${SERVICE_DOMAIN}/sendmail`;

//**login endpoint
export const SERVICE_LOGIN_ENDPOINT = `${SERVICE_DOMAIN}/login`;

//**report endpoint
export const SERVICE_REPORT_ENDPOINT = `${SERVICE_DOMAIN}/report`;

//**directpdf endpoint
export const SERVICE_DIRECTPDF_ENDPOINT = `${SERVICE_DOMAIN}/directpdf`;

//**repx endpoint
export const SERVICE_REPX_ENDPOINT = `${SERVICE_DOMAIN}/repxreport`;

