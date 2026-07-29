'use client';
import { PlanCard } from '@/features/billing/components/plan-card';
import { useCheckout } from '@/features/billing/hooks/use-checkout';
import { PLANS, PlanTier } from '@/shared/const/plans.const';

type BillingPageProps = {
  currentPlan: PlanTier;
  success?: boolean;
};

export const BillingPage = ({ currentPlan, success }: BillingPageProps) => {
  const { checkout, loading, error } = useCheckout();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose the plan that fits your shop.</p>
      </div>

      {success && (
        <p className="rounded-md border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
          Your plan has been updated.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Object.values(PLANS).map((plan) => (
          <PlanCard
            key={plan.tier}
            plan={plan}
            isCurrent={plan.tier === currentPlan}
            onUpgrade={checkout}
            upgrading={loading === plan.tier}
          />
        ))}
      </div>
    </div>
  );
};
