import type { CoreConfig, ErpConnection, ErpUser } from '@/features/auth/types';
import type { UnlockedAppEntry } from '@/features/core/types';

import { getJsonItem, removeItem, setJsonItem } from './asyncStore';
import { STORAGE_KEYS } from './keys';
import { getSecureItem, removeSecureItem, setSecureItem } from './secureStore';

function isCoreConfig(value: unknown): value is CoreConfig {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.apiBaseUrl === 'string' && v.apiBaseUrl.length > 0 && typeof v.db === 'string';
}

function isErpUser(value: unknown): value is ErpUser {
  if (!value || typeof value !== 'object') return false;
  return typeof (value as Record<string, unknown>).korime === 'string';
}

function isErpConnection(value: unknown): value is ErpConnection {
  return !!value && typeof value === 'object';
}

function isUnlockedAppList(value: unknown): value is UnlockedAppEntry[] {
  return Array.isArray(value) && value.every((item) => item && typeof (item as UnlockedAppEntry).code === 'string');
}

export async function getStoredCoreConfig(): Promise<CoreConfig | null> {
  const value = await getJsonItem<CoreConfig>(STORAGE_KEYS.async.coreConfig);
  if (!isCoreConfig(value)) {
    if (value !== null) {
      await removeItem(STORAGE_KEYS.async.coreConfig);
    }
    return null;
  }
  return value;
}

export async function setStoredCoreConfig(config: CoreConfig): Promise<void> {
  await setJsonItem(STORAGE_KEYS.async.coreConfig, config);
}

export async function clearStoredCoreConfig(): Promise<void> {
  await removeItem(STORAGE_KEYS.async.coreConfig);
}

export async function getStoredUser(): Promise<ErpUser | null> {
  const value = await getJsonItem<ErpUser>(STORAGE_KEYS.async.user);
  if (!isErpUser(value)) {
    if (value !== null) {
      await removeItem(STORAGE_KEYS.async.user);
    }
    return null;
  }
  return value;
}

export async function setStoredUser(user: ErpUser): Promise<void> {
  await setJsonItem(STORAGE_KEYS.async.user, user);
}

export async function getStoredConnection(): Promise<ErpConnection | null> {
  const value = await getJsonItem<ErpConnection>(STORAGE_KEYS.async.connection);
  if (!isErpConnection(value)) {
    if (value !== null) {
      await removeItem(STORAGE_KEYS.async.connection);
    }
    return null;
  }
  return value;
}

export async function setStoredConnection(connection: ErpConnection): Promise<void> {
  await setJsonItem(STORAGE_KEYS.async.connection, connection);
}

export async function getStoredUnlockedApps(): Promise<UnlockedAppEntry[]> {
  const value = await getJsonItem<UnlockedAppEntry[]>(STORAGE_KEYS.async.unlockedApps);
  if (!isUnlockedAppList(value)) {
    if (value !== null) {
      await removeItem(STORAGE_KEYS.async.unlockedApps);
    }
    return [];
  }
  return value;
}

export async function setStoredUnlockedApps(apps: UnlockedAppEntry[]): Promise<void> {
  await setJsonItem(STORAGE_KEYS.async.unlockedApps, apps);
}

export async function getInstallationId(): Promise<string | null> {
  return getSecureItem(STORAGE_KEYS.secure.deviceInstallationId);
}

export async function setInstallationId(id: string): Promise<void> {
  await setSecureItem(STORAGE_KEYS.secure.deviceInstallationId, id);
}

/**
 * Odjava briše samo korisničku sesiju (user + connection) — core aktivacija i lista
 * otključanih aplikacija ostaju, isto ponašanje kao postojeći `logOut` thunk
 * (src/pages/auth/store/index.jsx:4-17): korisnik ne mora ponovno unositi Core PIN.
 */
export async function clearUserSessionStorage(): Promise<void> {
  await removeItem(STORAGE_KEYS.async.user);
  await removeItem(STORAGE_KEYS.async.connection);
}

/** Briše Core aktivaciju i korisničku sesiju — zadržava installation ID uređaja. */
export async function clearCoreActivationStorage(): Promise<void> {
  await Promise.all([
    removeItem(STORAGE_KEYS.async.coreConfig),
    removeItem(STORAGE_KEYS.async.user),
    removeItem(STORAGE_KEYS.async.connection),
    removeItem(STORAGE_KEYS.async.unlockedApps),
  ]);
}

/** Potpuni reset — briše i installation ID uređaja. */
export async function resetAllSessionStorage(): Promise<void> {
  await Promise.all([
    removeItem(STORAGE_KEYS.async.coreConfig),
    removeItem(STORAGE_KEYS.async.user),
    removeItem(STORAGE_KEYS.async.connection),
    removeItem(STORAGE_KEYS.async.unlockedApps),
    removeSecureItem(STORAGE_KEYS.secure.deviceInstallationId),
  ]);
}
