/**
 * Core API domena — koristi se prije Core PIN aktivacije (spPinCoreAzur, spPinAppAzur
 * uvijek idu protiv OperaMobile baze preko ove domene, bez obzira na tenant).
 * Identična vrijednost kao SERVICE_CORE_DOMAIN u src/constants.ts.
 */
export const CORE_API_DOMAIN = 'https://erp.svamplus.hr/testapi/api';

/**
 * Postojeći kompatibilnosni Basic Auth header koji backend zahtijeva za sve pozive
 * na /data i /login. Poznati sigurnosni dug (v. docs/ai/KNOWN_RISKS.md) — ne mijenja
 * se dok backend ne podrži pravu autentikaciju. Vrijednost je identična onoj u
 * src/utils/dataHelper.js ("Basic dGVzdDoxMjM=" = "test:123").
 */
export const LEGACY_BASIC_AUTH_HEADER = 'Basic dGVzdDoxMjM=';

export const REQUEST_TIMEOUT_MS = 20000;
