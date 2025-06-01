import axios from 'axios';

let accessToken: string | null = null;

//Set the token
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

//Get the token (used by AuthContext to check if we already have one)
export const getAccessToken = () => accessToken;

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // 💡 allow HttpOnly cookies to be sent automatically
});

// 🔁 Intercept responses to handle expired access tokens
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newToken = res.data.accessToken;
        setAccessToken(newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshErr) {
        console.error('Refresh failed:', refreshErr);
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  },
);

// 🔐 Inject token into all outgoing requests
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
