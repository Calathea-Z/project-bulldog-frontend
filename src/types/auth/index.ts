export type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated'; accessToken: null }
  | { status: 'authenticated'; accessToken: string };

export type AuthContextValue = AuthState & {
  logout: () => void;
  setAuthenticated: (token: string) => void;
};
