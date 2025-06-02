export type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; token: string };

export type AuthContextValue = AuthState & {
  logout: () => void;
  setAuthenticated: (token: string) => void;
};
