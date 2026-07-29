import { redirect } from 'next/navigation';

import { MerchantListingsGrid } from '@/features/listings/components/merchant-listings-grid';
import { getListingsByShopService } from '@/features/listings/service/listing.service';
import { getShopByOwnerIdService } from '@/features/shops/service/shop.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };

export default async function DashboardListingsPage() {
  const session = await auth();
  const userId = (session?.user as SessionUser | undefined)?.id ?? '';

  const shopResult = await getShopByOwnerIdService(userId);
  if ('error' in shopResult.data) redirect('/dashboard');

  const listingsResult = await getListingsByShopService(userId, 1, 50);
  const listings = 'error' in listingsResult.data ? [] : listingsResult.data.items;

  return <MerchantListingsGrid listings={listings} />;
}
