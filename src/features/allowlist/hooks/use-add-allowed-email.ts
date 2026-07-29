'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AddAllowedEmailType } from '@/features/allowlist/validations/allowlist.validation';
import { http } from '@/shared/lib/http';

export const useAddAllowedEmail = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addAllowedEmail = async (data: AddAllowedEmailType) => {
    setLoading(true);
    setError(null);
    try {
      await http.post('/admin/allowlist', data);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add email');
    } finally {
      setLoading(false);
    }
  };

  return { addAllowedEmail, loading, error };
};
