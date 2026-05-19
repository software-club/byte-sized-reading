import { storage } from "@/helpers/storage";

export const storeTokens = async (
  accessToken: string,
  refreshToken: string,
) => {
  await storage.setItemAsync("accessToken", accessToken);
  await storage.setItemAsync("refreshToken", refreshToken);
};

export const clearTokens = async () => {
  await storage.deleteItemAsync("accessToken");
  await storage.deleteItemAsync("refreshToken");
};

export const getTokens = async (): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> => {
  const accessToken = await storage.getItemAsync("accessToken");
  const refreshToken = await storage.getItemAsync("refreshToken");
  return { accessToken, refreshToken };
};
