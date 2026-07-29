import { notFound } from 'next/navigation';

import { ListingDetailPage as ListingDetailView } from '@/features/listings/components/listing-detail-page';
import { getListingByIdService } from '@/features/listings/service/listing.service';
import { getShopByIdService } from '@/features/shops/service/shop.service';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const listingResult = await getListingByIdService(id);
  if ('error' in listingResult.data) notFound();

  const shopResult = await getShopByIdService(listingResult.data.shopId);
  const shop = 'error' in shopResult.data ? null : shopResult.data;

  return <ListingDetailView listing={listingResult.data} shop={shop} />;
}
