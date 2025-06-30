import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { api, handlePostLogin, setAccessToken } from '@/services';
import type { TwoFactorPendingDto } from '@/types/auth';

/**
 * Custom hook for managing login form state and authentication flow
 * Handles email/password login, 2FA verification, and email verification resend
 */
export function useLoginForm() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');

  // Two-factor authentication state
  const [twoFactorUserId, setTwoFactorUserId] = useState<string | null>(null);
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorPendingDto | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'sms' | 'email'>('sms');

  // Debounce state for resend verification email
  const [resendTimeout, setResendTimeout] = useState<NodeJS.Timeout | null>(null);

  // Computed values for UI state
  const showMethodSelection = twoFactorUserId && !isCodeSent;
  const showOtpInput = twoFactorUserId && isCodeSent;

  /**
   * Resets all form state to initial values
   * Called after successful login or verification to clean up memory
   */
  function resetState() {
    setOtpCode('');
    setPassword('');
    setTwoFactorUserId(null);
    setTwoFactorData(null);
    setIsCodeSent(false);
    setError('');

    // Clear any pending resend timeout
    if (resendTimeout) {
      clearTimeout(resendTimeout);
      setResendTimeout(null);
    }
  }

  /**
   * Handles the initial login attempt with email and password
   * Manages both direct login and 2FA flow initiation
   */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await api
        .post('/auth/login', { email, password }, { suppressErrorToast: true } as any)
        .then((res) => res.data);
      setPassword('');

      if (data.auth) {
        handlePostLogin(data.auth);
        toast.success('Login successful!');
        router.push('/dashboard');
        resetState();
      } else if (data.twoFactor) {
        setTwoFactorUserId(data.twoFactor.userId);
        setTwoFactorData(data.twoFactor);
        setIsCodeSent(false);
        setSelectedMethod(data.twoFactor.canUseSms ? 'sms' : 'email');
        toast.success('Please choose how to receive your 2FA code.');
      } else {
        throw new Error('Unexpected login response');
      }
    } catch (err: any) {
      setPassword('');
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Requests a 2FA verification code via the selected method (SMS or email)
   */
  async function handleRequestTwoFactor() {
    if (!twoFactorUserId) return;

    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/request-2fa', {
        userId: twoFactorUserId,
        method: selectedMethod,
      });

      toast.success(`Verification code sent via ${selectedMethod === 'sms' ? 'SMS' : 'email'}!`);
      setIsCodeSent(true);
    } catch {
      setError('Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Verifies the 2FA OTP code and completes the authentication process
   */
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await api
        .post('/auth/verify-2fa', {
          userId: twoFactorUserId,
          code: otpCode,
          verificationMethod: selectedMethod,
        })
        .then((res) => res.data);

      if (result.auth) {
        setAccessToken(result.auth.accessToken);
        handlePostLogin(result.auth);
        toast.success('2FA verified!');
        router.push('/dashboard');
        resetState();
      } else {
        throw new Error('Unexpected 2FA response');
      }
    } catch (err: any) {
      // Get specific error message from response or use fallback
      const errorMessage =
        err?.response?.data?.message || err?.response?.data || '2FA verification failed.';

      // Log error for debugging (without sensitive data)
      console.error('2FA verification error:', {
        status: err?.response?.status,
        message: errorMessage,
        hasUserId: !!twoFactorUserId,
        method: selectedMethod,
      });

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Re-sends email verification for unverified accounts
   * Includes debouncing to prevent accidental double-submits
   */
  async function handleResendVerificationEmail() {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }

    // Clear any existing timeout to prevent double-submits
    if (resendTimeout) {
      clearTimeout(resendTimeout);
    }

    // Set a new timeout to debounce the request
    const timeout = setTimeout(async () => {
      setIsResending(true);
      try {
        const response = await api.post('/auth/resend-verification-email', { email });
        toast.success(response.data.message);
        setError('');
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Failed to resend email. Please try again.';
        toast.error(msg);
      } finally {
        setIsResending(false);
        setResendTimeout(null);
      }
    }, 300); // 300ms debounce delay

    setResendTimeout(timeout);
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    otpCode,
    setOtpCode,
    showPassword,
    setShowPassword,
    isLoading,
    isResending,
    error,
    showMethodSelection,
    showOtpInput,
    selectedMethod,
    setSelectedMethod,
    twoFactorData,
    handleLogin,
    handleRequestTwoFactor,
    handleVerifyOtp,
    handleResendVerificationEmail,
  };
}
