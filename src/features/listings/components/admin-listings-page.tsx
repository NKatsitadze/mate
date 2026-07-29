import { AdminListingsList } from '@/features/listings/components/admin-listings-list';
import { ListingResponse } from '@/features/listings/types/listing.types';

type AdminListingsPageProps = {
  listings: ListingResponse[];
};

export const AdminListingsPage = ({ listings }: AdminListingsPageProps) => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Admin</p>
        <h1 className="mt-1 text-2xl font-bold">Listings</h1>
      </div>
      <AdminListingsList listings={listings} />
    </div>
  );
};
