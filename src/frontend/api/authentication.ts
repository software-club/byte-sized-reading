import { instance } from "./axiosInstance";

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export const login = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  return { accessToken: "dummyAccessToken", refreshToken: "dummyRefreshToken" };
  // try {
  //   const response = await instance.post("/login", { username, password });
  //   return response.data as LoginResponse;
  // } catch (error) {
  //   throw error;
  // }
};

export const refreshToken = async (
  refreshToken: string,
): Promise<LoginResponse> => {
  try {
    const response = await instance.post("/refresh", { refreshToken });
    return response.data as LoginResponse;
  } catch (error) {
    throw error;
  }
};
