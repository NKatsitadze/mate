import { PaidPlanTier } from '@/features/billing/types/billing.types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PlanDefinition } from '@/shared/const/plans.const';

type PlanCardProps = {
  plan: PlanDefinition;
  isCurrent: boolean;
  onUpgrade: (tier: PaidPlanTier) => void;
  upgrading: boolean;
};

export const PlanCard = ({ plan, isCurrent, onUpgrade, upgrading }: PlanCardProps) => {
  const tier = plan.tier;

  return (
    <Card className={isCurrent ? 'border-primary' : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{plan.label}</CardTitle>
          {isCurrent && <Badge>Current plan</Badge>}
        </div>
        <p className="text-2xl font-bold">
          {plan.priceGel} GEL<span className="text-sm font-normal text-muted-foreground">/mo</span>
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="space-y-1 text-sm text-muted-foreground">
          {plan.featureBullets.map((bullet) => (
            <li key={bullet}>• {bullet}</li>
          ))}
        </ul>
        {(tier === 'pro' || tier === 'premium') && !isCurrent && (
          <Button onClick={() => onUpgrade(tier)} disabled={upgrading} className="w-full">
            {upgrading ? 'Redirecting…' : `Upgrade to ${plan.label}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
