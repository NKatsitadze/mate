import Link from 'next/link';

import { DailyUsage } from '@/features/listings/types/listing.types';
import { EditShopDialog } from '@/features/shops/components/edit-shop-dialog';
import { ShopResponse } from '@/features/shops/types/shop.types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PLANS, USAGE_METER_CELLS } from '@/shared/const/plans.const';
import { cn } from '@/shared/lib/utils';

type MerchantDashboardOverviewProps = {
  shop: ShopResponse;
  usage: DailyUsage;
};

export const MerchantDashboardOverview = ({ shop, usage }: MerchantDashboardOverviewProps) => {
  const plan = PLANS[shop.plan];
  const filled = usage.limit
    ? Math.round((usage.used / usage.limit) * USAGE_METER_CELLS)
    : USAGE_METER_CELLS;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="animate-rise flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overview</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{shop.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{shop.address}</p>
        </div>
        <Button asChild className="w-full font-semibold sm:w-auto">
          <Link href="/dashboard/listings/new">+ New listing</Link>
        </Button>
      </header>

      <section className="animate-rise animate-rise-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Shop profile</CardTitle>
            <EditShopDialog shop={shop} />
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>{shop.phone}</p>
            <p>{shop.address}</p>
            {shop.isVerified && <Badge className="mt-2">Verified</Badge>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{plan.label} plan</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/billing">Upgrade</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {usage.limit !== null ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Listings today</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {usage.used} / {usage.limit}
                  </span>
                </div>
                <div
                  className="flex gap-px"
                  role="img"
                  aria-label={`${usage.used} of ${usage.limit} listings used today`}
                >
                  {Array.from({ length: USAGE_METER_CELLS }).map((_, cell) => (
                    <span
                      key={cell}
                      className={cn('h-2 flex-1 rounded-sm', cell < filled ? 'bg-primary' : 'bg-muted')}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Unlimited listings — {usage.used} posted today.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
