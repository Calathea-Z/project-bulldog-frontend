export type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated'; accessToken: null }
  | { status: 'authenticated'; accessToken: string };

export type AuthContextValue = AuthState & {
  logout: () => void;
  setAuthenticated: (token: string) => void;
};

export interface TwoFactorPendingDto {
  userId: string; // Guid → string in TS
  message: string;
  email: string;
  phoneNumber: string;
  canUseEmail: boolean;
  canUseSms: boolean;
}

export interface TwoFactorVerifyRequestDto {
  userId: string;
  code: string;
  verificationMethod: 'sms' | 'email';
}
