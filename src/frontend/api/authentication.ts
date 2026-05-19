import { instance } from "./axiosInstance";

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export const register = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await instance.post("/register", { email, password });

  return {
    accessToken: response.data.access,
    refreshToken: response.data.refresh
  } ;
};

export const login = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    const response = await instance.post("/login", { username, password });
    return {
    accessToken: response.data.access,
    refreshToken: response.data.refresh
  } ;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async (
  refreshToken: string,
): Promise<LoginResponse> => {
  try {
    const response = await instance.post("/refresh", { refreshToken });
    return {
    accessToken: response.data.access,
    refreshToken: response.data.refresh
  } ;
  } catch (error) {
    throw error;
  }
};