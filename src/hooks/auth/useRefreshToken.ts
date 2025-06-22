import axios from 'axios';
import { setAccessToken } from '@/services';
import { isIOS } from '@/utils';

export const useRefreshToken = () => {
  return async (): Promise<string | null> => {
    const localRefreshToken = localStorage.getItem('refreshToken');
    const isIOSDevice = isIOS();

    console.log('🔄 Refresh attempt - iOS detected:', isIOSDevice);
    console.log('🔄 Local refresh token present:', !!localRefreshToken);

    try {
      const res = isIOSDevice
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

      if (isIOSDevice && refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
        console.log('📱 iOS: New refresh token stored');
      }

      return accessToken;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.warn('❌ Refresh failed:', err.response?.data || err.message);
        console.warn('❌ Status:', err.response?.status);
      } else {
        console.warn('❌ Refresh failed:', err);
      }
      return null;
    }
  };
};
