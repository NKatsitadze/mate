'use client';
import { ShopForm } from '@/features/shops/components/shop-form';
import { useCreateShop } from '@/features/shops/hooks/use-create-shop';

export const ShopOnboarding = () => {
  const { createShop, loading, error } = useCreateShop();

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="text-2xl font-bold">Set up your shop</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us about your shop before you start posting listings.
      </p>
      <div className="mt-6">
        <ShopForm mode="onboarding" onSubmit={createShop} submitting={loading} error={error} />
      </div>
    </div>
  );
};
