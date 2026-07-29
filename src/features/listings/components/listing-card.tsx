import Image from 'next/image';
import Link from 'next/link';

import { ListingResponse } from '@/features/listings/types/listing.types';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { getDiscountPercent, getExpiryLabel, getListingCategoryLabel } from '@/shared/utils/listing-display';

type ListingCardProps = {
  listing: ListingResponse;
};

export const ListingCard = ({ listing }: ListingCardProps) => {
  const discountPercent = getDiscountPercent(listing.originalPrice, listing.discountPrice);
  const categoryLabel = getListingCategoryLabel(listing.category);
  const expiryLabel = getExpiryLabel(listing.expiresAt);

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="gap-0 overflow-hidden py-0 transition-colors hover:border-primary/40">
        <div className="relative aspect-square bg-muted">
          {listing.images[0] ? (
            <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No photo</div>
          )}
          <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">-{discountPercent}%</Badge>
        </div>
        <CardContent className="space-y-1 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{categoryLabel}</p>
          <h3 className="truncate text-sm font-semibold">{listing.title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold">{listing.discountPrice} GEL</span>
            <span className="text-sm text-muted-foreground line-through">{listing.originalPrice} GEL</span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{listing.shopName}</p>
          <p className="text-xs text-muted-foreground">{expiryLabel}</p>
        </CardContent>
      </Card>
    </Link>
  );
};
