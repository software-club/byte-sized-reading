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

export const getTokens = async (): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> => {
  const accessToken = await secureStorage.getItemAsync("accessToken");
  const refreshToken = await secureStorage.getItemAsync("refreshToken");
  return { accessToken, refreshToken };
};
