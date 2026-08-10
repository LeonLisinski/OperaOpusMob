/**
 * Ugovor s Disp `POST /api/push/send` data payloadom.
 * Novi tipovi se dodaju u union — router ostaje jedan switch.
 */
export type PushNotificationType = 'raspored_obavijest';

export type PushData = {
  type?: string;
  datum?: string;
  [key: string]: string | undefined;
};

export type RegisterPushParams = {
  apiBaseUrl: string;
  tenantDb: string;
  sifOsobe: string;
};

export type RegisterPushResult =
  | { ok: true; token: string }
  | { ok: false; reason: 'unsupported' | 'permission_denied' | 'no_project_id' | 'token_failed' | 'save_failed'; message?: string };
