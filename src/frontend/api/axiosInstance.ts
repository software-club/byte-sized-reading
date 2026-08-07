import { clearTokens, getTokens, storeTokens } from "@/helpers/token";
import axios from "axios";
import { refreshAccessToken } from "./authentication";

export const baseURL = "http://localhost:8000";
export const apiBaseURL = `${baseURL}/api`;

export const instance = axios.create({ baseURL: apiBaseURL });

instance.interceptors.request.use(
  async (request) => {
    const { accessToken } = await getTokens();
    if (accessToken) {
      request.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response) => response, // Directly return successful responses.
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      const { refreshToken } = await getTokens();

      if (!refreshToken) {
        Promise.reject(error);
        return;
      }

      originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
      try {
        const response = await refreshAccessToken(refreshToken);

        const { accessToken, refreshToken: newRefreshToken } = response;

        await storeTokens(accessToken, newRefreshToken);
        // Update the authorization header with the new access token.
        instance.defaults.headers.common["Authorization"] =
          `Bearer ${accessToken}`;
        return instance(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        // Handle refresh token errors by clearing stored tokens and redirecting to the login page.
        console.error("Token refresh failed:", refreshError);
        await clearTokens();

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error); // For all other errors, return the error as is.
  },
);
