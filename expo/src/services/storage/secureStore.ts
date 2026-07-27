import * as SecureStore from 'expo-secure-store';

export async function getSecureItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    // Oštećen keychain/keystore unos — tretira se kao da ne postoji, ne ruši aplikaciju.
    return null;
  }
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Keystore nedostupan (npr. web build korišten za razvoj/testiranje) — vrijednost
    // ostaje samo u memoriji za trajanje sesije, ne smije rušiti tijek prijave.
  }
}

export async function removeSecureItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // v. setSecureItem
  }
}
