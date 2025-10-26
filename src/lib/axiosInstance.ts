// src/api/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getUserCookie, updateTokens, removeUserCookie } from "../utils/cookie";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Track refresh process to avoid multiple parallel refreshes
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

// ✅ FIX: use InternalAxiosRequestConfig
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userData = getUserCookie();
    const token = (userData && (userData.token || userData?.data?.token)) || undefined;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const userData = getUserCookie();

    const refreshToken = userData?.refreshToken || userData?.data?.refreshToken;
    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const { token: newToken, refreshToken: newRefreshToken } = refreshRes.data.data;
        updateTokens(newToken, newRefreshToken);

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeUserCookie();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
