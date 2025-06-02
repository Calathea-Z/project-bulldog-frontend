import { setAccessToken } from '@/lib/api';
import { isIOS } from '@/utils/device';

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
