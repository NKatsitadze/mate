import { redirect } from 'next/navigation';

import { BillingPage } from '@/features/billing/components/billing-page';
import { getSubscriptionByShopService } from '@/features/billing/service/billing.service';
import { getShopByOwnerIdService } from '@/features/shops/service/shop.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };

export default async function DashboardBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await auth();
  const userId = (session?.user as SessionUser | undefined)?.id ?? '';

  const shopResult = await getShopByOwnerIdService(userId);
  if ('error' in shopResult.data) redirect('/dashboard');

  const subscriptionResult = await getSubscriptionByShopService(userId);
  const currentPlan = 'error' in subscriptionResult.data ? 'free' : subscriptionResult.data.plan;

  return <BillingPage currentPlan={currentPlan} success={status === 'success'} />;
}
