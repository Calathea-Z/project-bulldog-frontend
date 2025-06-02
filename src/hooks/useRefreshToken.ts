import axios from 'axios';
import { setAccessToken } from '@/services/api';
import { isIOS } from '@/utils/device';

/**
 * Custom hook for refreshing authentication tokens.
 *
 * @returns {() => Promise<string | null>} A function that refreshes the access token and returns the new token or null if refresh fails
 *
 * @description
 * This hook handles token refresh logic with special consideration for iOS devices.
 * For iOS devices, it uses localStorage for refresh token storage, while for other
 * platforms it uses HTTP-only cookies (withCredentials).
 *
 * The hook will:
 * - Attempt to refresh the access token using the stored refresh token
 * - Update the access token in the application state
 * - Store the new refresh token in localStorage for iOS devices
 * - Return the new access token or null if refresh fails
 *
 * @example
 * ```tsx
 * const refreshToken = useRefreshToken();
 *
 * // Later in your code:
 * const newToken = await refreshToken();
 * if (newToken) {
 *   // Token refresh successful
 * } else {
 *   // Token refresh failed
 * }
 * ```
 *
 * @throws {AxiosError} When the refresh request fails
 */
export const useRefreshToken = () => {
  return async (): Promise<string | null> => {
    const localRefreshToken = localStorage.getItem('refreshToken');

    try {
      const res = isIOS()
        ? await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            token: localRefreshToken,
          })
        : await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {},
            { withCredentials: true },
          );

      const { accessToken, refreshToken } = res.data;
      setAccessToken(accessToken);

      if (isIOS() && refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      return accessToken;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.warn('❌ Refresh failed:', err.response?.data || err.message);
      } else {
        console.warn('❌ Refresh failed:', err);
      }
      return null;
    }
  };
};
