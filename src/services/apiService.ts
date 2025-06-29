import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { RetryableRequest } from '@/types';

// Top-level constants for better maintainability
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
const EXCLUDED_REFRESH_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/resend-verification-email',
];

let accessToken: string | null = null;
let isRefreshing = false;
let cachedUserTimeZone: string | null = null;

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
    // Log error without exposing sensitive data
    console.error('🔐 Refresh failed:', err instanceof Error ? err.message : 'Unknown error');
    return null;
  }
};

/**
 * Request interceptor to attach the access token and timezone to outgoing requests
 */
api.interceptors.request.use(async (config) => {
  if (accessToken && config.headers) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Don't add timezone headers for auth routes to avoid circular dependency
  const isAuthRoute = config.url && AUTH_ROUTES.some((route) => config.url!.includes(route));

  // Add user timezone header for cross-device consistency (only for non-auth routes)
  if (!isAuthRoute && config.headers && !config.headers['X-User-TimeZone']) {
    // Use simple browser detection to avoid circular dependency
    if (!cachedUserTimeZone) {
      try {
        cachedUserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (error) {
        console.warn('Failed to get user timezone from browser:', error);
        cachedUserTimeZone = 'UTC';
      }
    }

    if (cachedUserTimeZone) {
      config.headers['X-User-TimeZone'] = cachedUserTimeZone;
    }
  }

  return config;
});

/**
 * Response interceptor to handle token expiration and refresh
 * - Retries failed requests with new token
 * - Queues concurrent requests during refresh
 * - Redirects to login on refresh failure
 * - Handles 401 errors globally with user-friendly messages
 */
api.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    console.log('🌐 API Error:', {
      url: err.config?.url,
      status: err.response?.status,
      message: err.message,
    });

    const originalRequest = err.config as RetryableRequest;

    // Handle 401 errors globally with user-friendly messages
    if (err.response?.status === 401) {
      const errorMessage = err.response?.data;
      let userMessage = 'Authentication failed. Please try again.';

      // Parse error messages
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('verify your email address')) {
          userMessage =
            'Please verify your email address before signing in. Check your inbox for a verification code.';
        } else if (errorMessage.includes('Invalid credentials')) {
          userMessage = 'Invalid email or password. Please try again.';
        } else if (errorMessage.includes('2FA')) {
          userMessage = 'Two-factor authentication failed. Please try again.';
        } else {
          userMessage = errorMessage;
        }
      }

      // Show toast notification for 401 errors with throttling to prevent spam
      toast.error(userMessage, { id: 'auth-error' });

      // For auth routes, don't attempt token refresh, just reject with the error
      if (
        originalRequest.url &&
        EXCLUDED_REFRESH_ROUTES.some((route) => originalRequest.url!.includes(route))
      ) {
        console.log('🌐 Auth route 401, not retrying:', originalRequest.url);
        return Promise.reject(err);
      }

      // For non-auth routes, attempt token refresh
      if (!originalRequest._retry) {
        console.log('🌐 401 error, attempting token refresh...');
        originalRequest._retry = true;

        if (isRefreshing) {
          console.log('🌐 Already refreshing, queuing request...');
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest });
          });
        }

        try {
          isRefreshing = true;
          console.log('Starting token refresh...');
          const newToken = await tryRefreshAccessToken();

          if (!newToken) {
            console.log('Token refresh failed, redirecting to login...');
            setAccessToken(null);
            window.location.href = '/login';
            return Promise.reject(err);
          }

          console.log('Token refresh successful, retrying request...');
          setAccessToken(newToken);
          processQueue(null, newToken);

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          return api(originalRequest);
        } catch (refreshError: unknown) {
          console.log('Token refresh error:', refreshError);
          const axiosError = refreshError as AxiosError;
          processQueue(axiosError, null);
          setAccessToken(null);
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    // Handle other error statuses with generic toast notifications and throttling
    if (err.response?.status >= 500) {
      toast.error('Server error. Please try again later.', { id: 'server-error' });
    } else if (err.response?.status === 403) {
      toast.error("Access denied. You don't have permission to perform this action.", {
        id: 'access-denied',
      });
    } else if (err.response?.status === 404) {
      toast.error('Resource not found.', { id: 'not-found' });
    } else if (err.response?.status === 422) {
      // Validation errors - let the component handle these specifically
      console.log('Validation error:', err.response?.data);
    } else if (err.response?.status >= 400 && err.response?.status < 500) {
      // Other client errors - show generic message
      toast.error('Request failed. Please check your input and try again.', { id: 'client-error' });
    }

    return Promise.reject(err);
  },
);

/**
 * Clear the cached user timezone to force a refresh
 * Call this when the user updates their timezone in settings
 */
export const clearCachedUserTimeZone = () => {
  cachedUserTimeZone = null;
};
