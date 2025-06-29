'use client';

import Image from 'next/image';
import Link from 'next/link';
import icon512 from '../../../../public/icon-512.png';
import { Eye, EyeOff } from 'lucide-react';
import { useRedirectIfAuthenticated, useLoginForm } from '@/hooks';
import { ThemeToggle } from '@/components';
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

  const step = showMethodSelection ? 'method' : showOtpInput ? 'otp' : 'login';

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-zinc-100 flex items-center justify-center p-4 relative">
      <motion.form
        onSubmit={showOtpInput ? handleVerifyOtp : handleLogin}
        className="w-full max-w-md bg-zinc-900 border border-zinc-700 shadow-lg rounded-2xl p-8 space-y-6"
        aria-busy={isLoading}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // easeOutExpo
      >
        <div className="flex justify-center mb-4">
          <Image src={icon512} alt="Bulldog Logo" width={64} height={64} priority />
        </div>
        <h1 className="text-2xl font-bold text-center text-primary mb-2">Welcome Back</h1>
        <p className="text-sm text-zinc-400 tracking-wide text-center mb-4">
          {showMethodSelection
            ? 'Choose how to receive your verification code'
            : showOtpInput
              ? 'Enter your verification code'
              : 'Sign in with your email and password to continue.'}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
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
                    className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    aria-invalid={!!error && error.toLowerCase().includes('email')}
                    aria-label="Email address"
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
                    className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    aria-invalid={!!error && error.toLowerCase().includes('password')}
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-10 text-zinc-400 hover:text-primary"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </>
            )}

            {showMethodSelection && !twoFactorData && (
              <div className="text-sm text-center text-zinc-500">Loading options...</div>
            )}

            {showMethodSelection && twoFactorData && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-400">We&apos;ll send a verification code to:</p>
                {twoFactorData.canUseSms && (
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('sms')}
                    className={`w-full p-3 rounded-md border transition text-left font-medium text-zinc-100 ${
                      selectedMethod === 'sms'
                        ? 'bg-primary border-primary text-white'
                        : 'bg-zinc-900 border-zinc-700 hover:border-primary'
                    }`}
                    disabled={isLoading}
                  >
                    📱 SMS{' '}
                    <span className="block text-xs opacity-80">{twoFactorData.phoneNumber}</span>
                  </button>
                )}
                {twoFactorData.canUseEmail && (
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('email')}
                    className={`w-full p-3 rounded-md border transition text-left font-medium text-zinc-100 ${
                      selectedMethod === 'email'
                        ? 'bg-primary border-primary text-white'
                        : 'bg-zinc-900 border-zinc-700 hover:border-primary'
                    }`}
                    disabled={isLoading}
                  >
                    📧 Email <span className="block text-xs opacity-80">{twoFactorData.email}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRequestTwoFactor}
                  className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  disabled={isLoading}
                >
                  {isLoading
                    ? 'Sending...'
                    : `Send Code via ${selectedMethod === 'sms' ? 'SMS' : 'Email'}`}
                </button>
              </div>
            )}

            {showOtpInput && (
              <div className="space-y-1">
                <label htmlFor="otp" className="sr-only">
                  6-digit verification code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  required
                  autoFocus
                  aria-label="6-digit verification code"
                  placeholder="Enter 6-digit code"
                  className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  disabled={isLoading}
                  aria-invalid={!!error && error.toLowerCase().includes('code')}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {(showOtpInput || !twoFactorData) && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            disabled={isLoading}
          >
            {showOtpInput
              ? isLoading
                ? 'Verifying...'
                : 'Verify Code'
              : isLoading
                ? 'Signing in...'
                : 'Sign In'}
          </motion.button>
        )}

        {!twoFactorData && (
          <>
            <hr className="my-4 border-zinc-700" />
            <div className="text-center text-sm text-zinc-400">
              <p>
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="text-primary hover:underline font-medium transition-colors inline-flex items-center gap-1"
                >
                  Sign up <span aria-hidden="true">→</span>
                </Link>
              </p>
            </div>
          </>
        )}

        {error && (
          <div className="text-sm text-center space-y-3" aria-live="polite">
            <div className="bg-red-50/10 border border-red-200/20 rounded-lg p-4">
              <p className="text-red-500 mb-2" role="alert">
                {error}
              </p>
              <div className="text-zinc-400 space-y-2">
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
      </motion.form>
    </main>
  );
}
