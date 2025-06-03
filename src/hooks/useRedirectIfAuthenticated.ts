'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/services/api';

export function useRedirectIfAuthenticated() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);
}
