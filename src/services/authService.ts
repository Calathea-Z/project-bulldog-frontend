import axios from 'axios';
import { getAccessToken, setAccessToken } from '@/services';
import { isIOS } from '@/utils';

/**
 * Sends a login request to the backend and returns auth tokens.
 */
export async function login(
  email: string,
): Promise<{ accessToken: string; refreshToken?: string }> {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    { email },
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
}

/**
 * Handles post-login operations including token storage and session management.
 */
export function handlePostLogin(data: { accessToken: string; refreshToken?: string }) {
  const { accessToken, refreshToken } = data;
  const isIOSDevice = isIOS();

  console.log('🔐 Post-login - iOS detected:', isIOSDevice);
  console.log('🔐 Refresh token received:', !!refreshToken);

  setAccessToken(accessToken);
  sessionStorage.setItem('hasLoggedIn', 'true');

  if (isIOSDevice && refreshToken) {
    try {
      localStorage.setItem('refreshToken', refreshToken);
      console.log('📱 iOS detected — refresh token stored in localStorage');
    } catch (error) {
      console.error('❌ Failed to store refresh token in localStorage:', error);
    }
  }
}

/**
 * Handles user logout by clearing authentication state and redirecting to login page.
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
