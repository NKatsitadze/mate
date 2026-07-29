'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { AUTH_ERROR_MESSAGES, DEFAULT_AUTH_ERROR_MESSAGE } from '@/shared/const/auth.const';

export const AuthErrorToast = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const code = searchParams.get('error');
    if (!code) return;

    toast.error(AUTH_ERROR_MESSAGES[code] ?? DEFAULT_AUTH_ERROR_MESSAGE);
    router.replace(pathname);
  }, [searchParams, router, pathname]);

  return null;
};
