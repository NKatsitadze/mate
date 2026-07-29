import { MerchantDashboardOverview } from '@/features/dashboard/components/merchant-dashboard-overview';
import { getDailyUsageService } from '@/features/listings/service/listing.service';
import { ShopOnboarding } from '@/features/shops/components/shop-onboarding';
import { getShopByOwnerIdService } from '@/features/shops/service/shop.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as SessionUser | undefined)?.id ?? '';

  const shopResult = await getShopByOwnerIdService(userId);
  if ('error' in shopResult.data) {
    return <ShopOnboarding />;
  }

  const usageResult = await getDailyUsageService(userId);
  const usage = 'error' in usageResult.data ? { used: 0, limit: null } : usageResult.data;

  return <MerchantDashboardOverview shop={shopResult.data} usage={usage} />;
}
