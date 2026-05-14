import * as SecureStore from "expo-secure-store";

const secureStorage = SecureStore;

export const storeTokens = async (
  accessToken: string,
  refreshToken: string,
) => {
  await secureStorage.setItemAsync("accessToken", accessToken);
  await secureStorage.setItemAsync("refreshToken", refreshToken);
};

export const clearTokens = async () => {
  await secureStorage.deleteItemAsync("accessToken");
  await secureStorage.deleteItemAsync("refreshToken");
};
