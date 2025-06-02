import axios from 'axios';
import { getAccessToken, setAccessToken, api } from '@/services/api';
import { isIOS } from '@/utils/device';

/**
 * Handles post-login operations including token storage and session management.
 *
 * @param {Object} data - The login response data
 * @param {string} data.accessToken - The JWT access token received from login
 * @param {string} [data.refreshToken] - Optional refresh token for iOS devices
 *
 * @description
 * This function:
 * - Stores the access token in the application state
 * - Sets a session flag indicating successful login
 * - For iOS devices, stores the refresh token in localStorage
 *
 * @example
 * ```tsx
 * const loginResponse = await loginAPI();
 * handlePostLogin(loginResponse);
 * ```
 */
export function handlePostLogin(data: { accessToken: string; refreshToken?: string }) {
  const { accessToken, refreshToken } = data;

  console.log('✅ accessToken from login:', accessToken);
  setAccessToken(accessToken);
  sessionStorage.setItem('hasLoggedIn', 'true');

  if (isIOS() && refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
    console.log('📱 iOS detected — refresh token stored in localStorage');
  }
}

/**
 * Handles user logout by clearing authentication state and redirecting to login page.
 *
 * @returns {Promise<void>}
 *
 * @description
 * This function:
 * - Makes a logout request to the server
 * - Clears the access token from application state
 * - Redirects the user to the login page
 * - Handles any errors during the logout process gracefully
 *
 * @example
 * ```tsx
 * // In a logout button handler
 * await logoutUser();
 * ```
 *
 * @throws {AxiosError} When the logout request fails, but the function will still
 * clear local state and redirect to login
 */
export async function logoutUser(): Promise<void> {
  const accessToken = getAccessToken();

  try {
    // Clear any stored refresh token for iOS devices
    if (isIOS()) {
      localStorage.removeItem('refreshToken');
    }

    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
      {},
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (err) {
    console.warn('Logout failed:', err);
  } finally {
    setAccessToken(null);
    sessionStorage.removeItem('hasLoggedIn');
  }
}
