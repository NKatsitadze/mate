import Image from 'next/image';

import { ListingShopInfoCard } from '@/features/listings/components/listing-shop-info-card';
import { ListingResponse } from '@/features/listings/types/listing.types';
import { ShopResponse } from '@/features/shops/types/shop.types';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';
import { Badge } from '@/shared/components/ui/badge';
import { formatDate } from '@/shared/utils/format';
import { getDiscountPercent, getExpiryLabel, getListingCategoryLabel } from '@/shared/utils/listing-display';

type ListingDetailPageProps = {
  listing: ListingResponse;
  shop: ShopResponse | null;
};

export const ListingDetailPage = ({ listing, shop }: ListingDetailPageProps) => {
  const discountPercent = getDiscountPercent(listing.originalPrice, listing.discountPrice);
  const categoryLabel = getListingCategoryLabel(listing.category);
  const expiryLabel = getExpiryLabel(listing.expiresAt);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-12 sm:px-10 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {listing.images[0] ? (
              <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No photo</div>
            )}
            <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">-{discountPercent}%</Badge>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{categoryLabel}</p>
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold">{listing.discountPrice} GEL</span>
              <span className="text-lg text-muted-foreground line-through">{listing.originalPrice} GEL</span>
            </div>
            {listing.description && <p className="text-sm text-muted-foreground">{listing.description}</p>}
            <p className="text-sm text-muted-foreground">
              {expiryLabel} &middot; {formatDate(listing.expiresAt)}
            </p>

            {shop && <ListingShopInfoCard shop={shop} />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
