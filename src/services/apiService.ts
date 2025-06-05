import axios, { AxiosInstance, AxiosError } from 'axios';
import { RetryableRequest } from '@/types';

let accessToken: string | null = null;
let isRefreshing = false;

let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: RetryableRequest;
}[] = [];

/**
 * Process the queue of failed requests after token refresh
 * @param error - Any error that occurred during refresh
 * @param token - The new access token if refresh was successful
 */
const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

/**
 * Set the in-memory access token for API requests
 * @param token - The JWT access token to store
 */
export const setAccessToken = (token: string | null) => {
  accessToken = token;

  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('accessToken', token);
    } else {
      sessionStorage.removeItem('accessToken');
    }
  }
};

/**
 * Get the current in-memory access token
 * @returns The current JWT access token or null if not set
 */
export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;

  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('accessToken');
    if (stored) {
      accessToken = stored;
      return stored;
    }
  }
  return null;
};

/**
 * Configured axios instance for API requests
 * Includes base URL and credentials handling
 */
export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

/**
 * Attempt to refresh the access token using the refresh token
 * @returns The new access token if successful, null otherwise
 */
const tryRefreshAccessToken = async (): Promise<string | null> => {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );

    return res.data.accessToken;
  } catch (err) {
    console.error('🔐 Refresh failed:', err);
    return null;
  }
};

/**
 * Request interceptor to attach the access token to outgoing requests
 */
api.interceptors.request.use((config) => {
  if (accessToken && config.headers) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * Response interceptor to handle token expiration and refresh
 * - Retries failed requests with new token
 * - Queues concurrent requests during refresh
 * - Redirects to login on refresh failure
 */
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config as RetryableRequest;

    if (originalRequest.url?.includes('/auth/refresh')) {
      window.location.href = '/login';
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      try {
        isRefreshing = true;
        const newToken = await tryRefreshAccessToken();

        if (!newToken) {
          window.location.href = '/login';
          return Promise.reject(err);
        }

        setAccessToken(newToken);
        processQueue(null, newToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError: unknown) {
        const axiosError = refreshError as AxiosError;
        processQueue(axiosError, null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  },
);
