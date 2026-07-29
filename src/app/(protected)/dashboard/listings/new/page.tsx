import { redirect } from 'next/navigation';

import { CreateListingPage } from '@/features/listings/components/create-listing-page';
import { getShopByOwnerIdService } from '@/features/shops/service/shop.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };

export default async function NewListingPage() {
  const session = await auth();
  const userId = (session?.user as SessionUser | undefined)?.id ?? '';

  const shopResult = await getShopByOwnerIdService(userId);
  if ('error' in shopResult.data) redirect('/dashboard');

  return <CreateListingPage />;
}
