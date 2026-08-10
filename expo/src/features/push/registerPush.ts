import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { clearPushTokenRequest, savePushTokenRequest } from '@/services/api/pushApi';

import type { RegisterPushParams, RegisterPushResult } from './types';

const ANDROID_CHANNEL_ID = 'raspored';

function resolveEasProjectId(): string | null {
  const fromEas = Constants.easConfig?.projectId;
  if (typeof fromEas === 'string' && fromEas.trim().length > 0) {
    return fromEas.trim();
  }
  const fromExtra = Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof fromExtra === 'string' && fromExtra.trim().length > 0) {
    return fromExtra.trim();
  }
  return null;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Raspored',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2A4549',
  });
}

/**
 * Traži dozvolu, dohvaća Expo push token i snima ga na MobKorisnik (SifOsobe).
 * Tihi fail — Raspored UI ne smije stati zbog pusha.
 */
export async function registerPushForSifOsobe(params: RegisterPushParams): Promise<RegisterPushResult> {
  if (Platform.OS === 'web') {
    return { ok: false, reason: 'unsupported' };
  }

  // Emulatori često nemaju pouzdan push; ne blokiramo razvoj, ali ne lažemo uspjeh.
  if (!Device.isDevice) {
    if (__DEV__) {
      console.warn('[push] Registracija preskočena — nije fizički uređaj.');
    }
    return { ok: false, reason: 'unsupported', message: 'Push zahtijeva fizički uređaj.' };
  }

  try {
    await ensureAndroidChannel();

    const current = await Notifications.getPermissionsAsync();
    let status = current.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') {
      return { ok: false, reason: 'permission_denied' };
    }

    const projectId = resolveEasProjectId();
    if (!projectId) {
      return { ok: false, reason: 'no_project_id', message: 'Nedostaje EAS projectId.' };
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResponse.data?.trim();
    if (!token) {
      return { ok: false, reason: 'token_failed', message: 'Expo nije vratio push token.' };
    }

    await savePushTokenRequest({
      apiBaseUrl: params.apiBaseUrl,
      tenantDb: params.tenantDb,
      sifOsobe: params.sifOsobe,
      pushToken: token,
    });

    if (__DEV__) {
      console.log('[push] Token snimljen za SifOsobe', params.sifOsobe);
    }
    return { ok: true, token };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (__DEV__) {
      console.warn('[push] Registracija nije uspjela:', message);
    }
    // Razlikuj lokalni token fail od SP greške (npr. nema MobKorisnik reda).
    const looksLikeSave =
      message.toLowerCase().includes('korisnik') ||
      message.toLowerCase().includes('mobkorisnik') ||
      message.toLowerCase().includes('nije prona');
    return {
      ok: false,
      reason: looksLikeSave ? 'save_failed' : 'token_failed',
      message,
    };
  }
}

/** Best-effort CLEAR_TOKEN pri odjavi — ne smije blokirati logout. */
export async function clearPushForSifOsobe(params: RegisterPushParams): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await clearPushTokenRequest(params);
  } catch (error) {
    if (__DEV__) {
      console.warn('[push] CLEAR_TOKEN nije uspio:', error instanceof Error ? error.message : error);
    }
  }
}
