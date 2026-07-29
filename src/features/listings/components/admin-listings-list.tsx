import { AdminListingStatusDialog } from '@/features/listings/components/admin-listing-status-dialog';
import { ListingResponse } from '@/features/listings/types/listing.types';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';

type AdminListingsListProps = {
  listings: ListingResponse[];
};

export const AdminListingsList = ({ listings }: AdminListingsListProps) => {
  if (listings.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No listings yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <Card key={listing.id}>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-sm font-semibold">{listing.title}</h3>
              <Badge variant={listing.status === 'deactivated' ? 'destructive' : 'outline'}>{listing.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{listing.shopName}</p>
            <p className="text-sm font-bold">{listing.discountPrice} GEL</p>
            <div className="pt-2">
              <AdminListingStatusDialog listingId={listing.id} status={listing.status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
