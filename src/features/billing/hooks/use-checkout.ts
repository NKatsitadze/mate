'use client';
import { useState } from 'react';

import { PaidPlanTier } from '@/features/billing/types/billing.types';
import { http } from '@/shared/lib/http';

export const useCheckout = () => {
  const [loading, setLoading] = useState<PaidPlanTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkout = async (plan: PaidPlanTier) => {
    setLoading(plan);
    setError(null);
    try {
      const { checkoutUrl } = await http.post<{ checkoutUrl: string }>('/billing/checkout', { plan });
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout');
      setLoading(null);
    }
  };

  return { checkout, loading, error };
};
