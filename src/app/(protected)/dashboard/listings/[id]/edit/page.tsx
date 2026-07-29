import { notFound, redirect } from 'next/navigation';

import { EditListingPage } from '@/features/listings/components/edit-listing-page';
import { getListingByIdService } from '@/features/listings/service/listing.service';
import { getShopByOwnerIdService } from '@/features/shops/service/shop.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };

export default async function DashboardEditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as SessionUser | undefined)?.id ?? '';

  const shopResult = await getShopByOwnerIdService(userId);
  if ('error' in shopResult.data) redirect('/dashboard');

  const listingResult = await getListingByIdService(id);
  if ('error' in listingResult.data) notFound();
  if (listingResult.data.shopId !== shopResult.data.id) redirect('/dashboard/listings');

  return <EditListingPage listing={listingResult.data} />;
}
