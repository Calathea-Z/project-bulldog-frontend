import axios from 'axios';
import { setAccessToken } from '@/services';
import { isIOS } from '@/utils';

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
