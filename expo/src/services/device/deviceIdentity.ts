import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { getInstallationId, setInstallationId } from '@/services/storage/sessionStorage';

export interface DeviceIdentity {
  /**
   * Identifikator uređaja koji se šalje kao DeviceUuid/DeviceSerial u spPinCoreAzur
   * i spPinAppAzur. Mora se podudarati s PinCore.DeviceUuid u OperaMobile bazi.
   *
   * Na Androidu Ionic/Capacitor šalje `Device.getId().identifier` — u praksi to na
   * produkcijskim uređajima odgovara Application.getAndroidId() (16 hex znakova, npr.
   * "d0a6a23435d0864e" za tenant jukic001). Expo generirani UUID ne matcha postojeći
   * PinCore zapis pa spPinAppAzur vraća prazan result set (PinCoreId ostane NULL).
   */
  installationId: string;
  isVirtual: boolean;
  manufacturer: string | null;
  model: string | null;
  osVersion: string | null;
  /** Isti kao installationId na Android/iOS; null na web/simulatoru bez platform ID-a. */
  platformDeviceId: string | null;
}

let cached: DeviceIdentity | null = null;

function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

async function resolvePlatformDeviceId(): Promise<string | null> {
  try {
    if (Platform.OS === 'android') {
      return Application.getAndroidId() ?? null;
    }
    if (Platform.OS === 'ios') {
      return (await Application.getIosIdForVendorAsync()) ?? null;
    }
  } catch {
    // Platform ID nije obavezan — fallback na perzistirani/generirani ID.
  }
  return null;
}

/**
 * Prioritet: platform ID (Android ID / iOS vendor) kad postoji — parity s Ionic
 * Capacitor Device.getId na istom fizičkom uređaju. Inače perzistirani ID ili novi UUID.
 */
async function resolveInstallationId(): Promise<string> {
  const platformId = await resolvePlatformDeviceId();
  if (platformId) {
    const existing = await getInstallationId();
    if (existing !== platformId) {
      await setInstallationId(platformId);
    }
    return platformId;
  }

  const existing = await getInstallationId();
  if (existing) {
    return existing;
  }

  const generated = generateUuidV4();
  await setInstallationId(generated);
  return generated;
}

/** Vraća identitet uređaja potreban za spPinCoreAzur/spPinAppAzur pozive. Rezultat je keširan po pokretanju aplikacije. */
export async function getDeviceIdentity(): Promise<DeviceIdentity> {
  if (cached) {
    return cached;
  }

  const installationId = await resolveInstallationId();

  cached = {
    installationId,
    isVirtual: !Device.isDevice,
    manufacturer: Device.manufacturer ?? null,
    model: Device.modelName ?? null,
    osVersion: Device.osVersion ?? null,
    platformDeviceId: installationId,
  };

  return cached;
}

/** Reset keša nakon promjene installation ID-a (npr. testovi). */
export function resetDeviceIdentityCache(): void {
  cached = null;
}
