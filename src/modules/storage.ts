import { LocalStorage } from "node-localstorage";
const localStorage = new LocalStorage("./storage", Number.MAX_VALUE);

export const setStorage = (key: string, value: any) => localStorage.setItem(key, JSON.stringify(value));
export const removeStorage = (key: string) => localStorage.removeItem(key);

export function getStorage<T>(key: string, fallbackValue?: T): T | undefined {
  const value = localStorage.getItem(key);
  if (value !== null) return JSON.parse(value);
  return fallbackValue;
}

export async function getStorageAsync<T>(key: string, getFallbackValue: () => Promise<T>): Promise<T> {
  const value = localStorage.getItem(key);
  if (value !== null) return JSON.parse(value);
  const fallbackValue = await getFallbackValue();
  if (fallbackValue) setStorage(key, fallbackValue);
  return fallbackValue;
}
