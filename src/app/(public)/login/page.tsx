'use client';

import Image from 'next/image';
import Link from 'next/link';
import icon512 from '../../../../public/icon-512.png';
import { Eye, EyeOff } from 'lucide-react';
import { useRedirectIfAuthenticated, useLoginForm } from '@/hooks';
import { LoadingScreen, ThemeToggle } from '@/components';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  useRedirectIfAuthenticated();

  const {
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
  } = useLoginForm();

  // Determine current step for animation transitions
  const step = showMethodSelection ? 'method' : showOtpInput ? 'otp' : 'login';

  return (
    <main className="min-h-screen bg-background text-text flex items-center justify-center p-4 relative">
      {isLoading && <LoadingScreen />}

      <form
        onSubmit={showOtpInput ? handleVerifyOtp : handleLogin}
        className="w-full max-w-sm bg-surface shadow-xl rounded-xl p-6 space-y-4 border border-primary"
        aria-busy={isLoading}
      >
        {/* Logo and Header */}
        <div className="flex justify-center mb-4 rounded-md">
          <Image src={icon512} alt="Bulldog Logo" width={64} height={64} priority />
        </div>

        <h1 className="text-2xl font-bold text-center text-primary">Welcome Back</h1>
        <p className="text-sm text-secondary text-center">
          {showMethodSelection
            ? 'Choose how to receive your verification code'
            : showOtpInput
              ? 'Enter your verification code'
              : 'Sign in with your email and password to continue.'}
        </p>

        {/* Animated Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Email/Password Fields - Only shown during initial login */}
            {!twoFactorData && (
              <>
                <div className="space-y-1">
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="w-full p-3 rounded bg-background border border-accent text-text placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    aria-invalid={!!error && error.toLowerCase().includes('email')}
                  />
                </div>

                <div className="relative space-y-1">
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    className="w-full p-3 rounded bg-background border border-accent text-text placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    aria-invalid={!!error && error.toLowerCase().includes('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-secondary hover:text-primary"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </>
            )}

            {/* Two-Factor Method Selection */}
            {showMethodSelection && twoFactorData && (
              <div className="space-y-4">
                <div className="text-sm text-secondary">
                  <p>We&apos;ll send a verification code to:</p>
                </div>

                {/* SMS Option */}
                {twoFactorData.canUseSms && (
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('sms')}
                    className={`w-full p-3 rounded border transition ${
                      selectedMethod === 'sms'
                        ? 'bg-primary border-primary text-surface'
                        : 'bg-background border-accent text-text hover:border-primary'
                    }`}
                    disabled={isLoading}
                  >
                    <div className="text-left">
                      <div className="font-medium">📱 SMS</div>
                      <div className="text-sm opacity-80">{twoFactorData.phoneNumber}</div>
                    </div>
                  </button>
                )}

                {/* Email Option */}
                {twoFactorData.canUseEmail && (
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('email')}
                    className={`w-full p-3 rounded border transition ${
                      selectedMethod === 'email'
                        ? 'bg-primary border-primary text-surface'
                        : 'bg-background border-accent text-text hover:border-primary'
                    }`}
                    disabled={isLoading}
                  >
                    <div className="text-left">
                      <div className="font-medium">📧 Email</div>
                      <div className="text-sm opacity-80">{twoFactorData.email}</div>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRequestTwoFactor}
                  className="w-full bg-accent text-surface py-2 rounded hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading
                    ? 'Sending...'
                    : `Send Code via ${selectedMethod === 'sms' ? 'SMS' : 'Email'}`}
                </button>
              </div>
            )}

            {/* OTP Input Field */}
            {showOtpInput && (
              <div className="space-y-1">
                <label htmlFor="otp" className="sr-only">
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  required
                  placeholder="Enter 6-digit code"
                  className="w-full p-3 rounded bg-background border border-accent text-text placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  disabled={isLoading}
                  aria-invalid={!!error && error.toLowerCase().includes('code')}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Submit Buttons */}
        {!twoFactorData && (
          <button
            type="submit"
            className="w-full bg-accent text-surface py-2 rounded hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        )}

        {showOtpInput && (
          <button
            type="submit"
            className="w-full bg-accent text-surface py-2 rounded hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        )}

        {/* Sign Up Link - Only shown during initial login */}
        {!twoFactorData && (
          <div className="text-center text-sm text-secondary">
            <p>
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-primary hover:text-accent transition-colors font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        )}

        {/* Error Display and Help Options */}
        {error && (
          <div className="text-sm text-center space-y-3" aria-live="polite">
            <div className="bg-red-50/10 border border-red-200/20 rounded-lg p-4">
              <p className="text-red-500 mb-2" role="alert">
                {error}
              </p>
              <div className="text-secondary space-y-2">
                {error.includes('verify your email address') ? (
                  <>
                    <p>Need help with email verification?</p>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handleResendVerificationEmail}
                        className="text-primary hover:text-accent transition-colors disabled:opacity-50"
                        disabled={isResending}
                      >
                        {isResending ? 'Sending...' : 'Resend verification email'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>Need help signing in?</p>
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/signup"
                        className="text-primary hover:text-accent transition-colors"
                      >
                        Create a new account
                      </Link>
                      <Link
                        href="/reset-password"
                        className="text-primary hover:text-accent transition-colors"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </form>

      <div className="absolute bottom-4 right-4">
        <ThemeToggle />
      </div>
    </main>
  );
}
