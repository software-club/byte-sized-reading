import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export interface Storage {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

const webStorage: Storage = {
  getItemAsync: async (key) => localStorage.getItem(key),
  setItemAsync: async (key, value) => localStorage.setItem(key, value),
  deleteItemAsync: async (key) => localStorage.removeItem(key),
};

const nativeStorage: Storage = {
  getItemAsync: (key) => SecureStore.getItemAsync(key),
  setItemAsync: (key, value) => SecureStore.setItemAsync(key, value),
  deleteItemAsync: (key) => SecureStore.deleteItemAsync(key),
};

export const storage: Storage =
  Platform.OS === "web" ? webStorage : nativeStorage;
