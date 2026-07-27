import type { DeviceIdentity } from '@/services/device/deviceIdentity';

import { apiPost } from './client';
import { CORE_API_DOMAIN } from './config';

const CORE_DATA_ENDPOINT = `${CORE_API_DOMAIN}/data`;

export type AppUnlockRawEntry = { code: string; db: string };

/**
 * Odgovor spPinCoreAzur (action=unlock) s `singlerow: true`.
 * API (ConvertDtToJson.cs + TableHelper.cs) lowercasira stupce i flattena prvi
 * result set u root objekt: serverpath, db, layoutprefix, pin, admin; drugi result
 * set ide u table2 (Ionic ga ne koristi za unlocked state).
 */
export interface CoreUnlockRawResponse {
  serverpath: string;
  db: string;
  layoutprefix: string | null;
  pin?: string;
  admin?: boolean | string;
  table2?: AppUnlockRawEntry[];
}

/**
 * Core PIN aktivacija — identičan request oblik kao UnlockCore.tsx:58-76.
 * Uvijek ide na CORE_API_DOMAIN + '/data' s db='OperaMobile', bez obzira na tenant.
 */
export async function coreUnlockRequest(pin: string, device: DeviceIdentity): Promise<CoreUnlockRawResponse> {
  return apiPost<CoreUnlockRawResponse>({
    url: CORE_DATA_ENDPOINT,
    body: {
      db: 'OperaMobile',
      queries: [
        {
          query: 'spPinCoreAzur',
          params: {
            action: 'unlock',
            pushRegistrationId: null,
            pin,
            refreshToken: null,
            DeviceCordova: null,
            DeviceIsVirtual: device.isVirtual,
            DeviceManufacturer: device.manufacturer,
            DeviceModel: device.model,
            DeviceSerial: device.installationId,
            DeviceUuid: device.installationId,
            DeviceVersion: device.osVersion,
          },
          singlerow: true,
        },
      ],
    },
  });
}

/** Polja poznata iz upotrebe u kodu (korime, name, grupa, sifosobe, sifgrupe) — ostala nisu potvrđena. */
export interface ErpUserRaw {
  korime?: string;
  name?: string;
  grupa?: string;
  sifosobe?: string | number;
  sifgrupe?: string | number;
  [key: string]: unknown;
}

export interface ErpConnectionRaw {
  database?: string;
  server?: string;
  [key: string]: unknown;
}

export interface ErpLoginRawResponse {
  user: ErpUserRaw[] | ErpUserRaw;
  connection: ErpConnectionRaw;
}

/** ERP login — identičan request oblik kao Login.tsx:88 + dataHelper.js login():266-288. */
export async function erpLoginRequest(params: {
  apiBaseUrl: string;
  db: string;
  uid: string;
  pwd: string;
}): Promise<ErpLoginRawResponse> {
  return apiPost<ErpLoginRawResponse>({
    url: `${params.apiBaseUrl}/login`,
    body: { db: params.db, uid: params.uid, pwd: params.pwd },
  });
}

/**
 * Odgovor spPinAppAzur (action=unlock): `select distinct a.Code, p.Db` za sve
 * aplikacije otključane za taj PinCoreId (ne samo upravo otključanu) — prema
 * UnlockApp.jsx:46-75. API (TableHelper.RemoveDataTableColums) vraća JSON niz redova
 * na root razini; normalizer u responseNormalizers.ts prihvaća i `{ table1: [...] }`.
 */
export type AppUnlockRawResponse =
  | AppUnlockRawEntry[]
  | { value?: AppUnlockRawEntry[]; Count?: number; table1?: AppUnlockRawEntry[] };

/** App PIN otključavanje — identičan request oblik kao UnlockApp.jsx:46-57. */
export async function appUnlockRequest(params: {
  pin: string;
  appCode: string;
  tenantDb: string;
  deviceUuid: string;
}): Promise<AppUnlockRawResponse> {
  return apiPost<AppUnlockRawResponse>({
    url: CORE_DATA_ENDPOINT,
    body: {
      db: 'OperaMobile',
      queries: [
        {
          query: 'spPinAppAzur',
          params: {
            action: 'unlock',
            db: params.tenantDb,
            pin: params.pin,
            appCode: params.appCode,
            deviceUuid: params.deviceUuid,
          },
        },
      ],
    },
  });
}
