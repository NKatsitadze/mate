import { AdminListingsPage as AdminListingsView } from '@/features/listings/components/admin-listings-page';
import { listAllListingsService } from '@/features/listings/service/listing.service';

export default async function AdminListingsPage() {
  const listingsResult = await listAllListingsService(1, 100);
  const listings = 'error' in listingsResult.data ? [] : listingsResult.data.items;

  return <AdminListingsView listings={listings} />;
}
