import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getJsonItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    // Oštećen ili nekompatibilan (zastarjeli oblik) zapis — tretira se kao prazan.
    return null;
  }
}

export async function setJsonItem(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
