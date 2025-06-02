import axios, { AxiosInstance } from 'axios';
import { RetryableRequest } from '@/types';

let accessToken: string | null = null;

/**
 * Set the in-memory access token
 */
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

/**
 * Get the in-memory access token
 */
export const getAccessToken = () => accessToken;

// 🔧 Create typed axios instance
export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

/**
 * Refresh the access token from backend
 */
const tryRefreshAccessToken = async (): Promise<string | null> => {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );

    const newToken = res.data.accessToken;
    setAccessToken(newToken);
    return newToken;
  } catch (err) {
    console.error('🔐 Refresh failed:', err);
    return null;
  }
};

// 🔐 Attach token to outgoing requests
api.interceptors.request.use((config) => {
  if (accessToken && config.headers) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

// 🔁 Handle expired access tokens and retry once
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config as RetryableRequest;

    // 🛑 Prevent loop if refresh itself fails
    if (originalRequest.url?.includes('/auth/refresh')) {
      window.location.href = '/login';
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await tryRefreshAccessToken();

      if (newToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      }

      window.location.href = '/login';
    }

    return Promise.reject(err);
  },
);
