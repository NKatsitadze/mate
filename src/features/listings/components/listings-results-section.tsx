'use client';
import { ListingCard } from '@/features/listings/components/listing-card';
import { useListings } from '@/features/listings/hooks/use-listings';

export const ListingsResultsSection = () => {
  const { listings, loading, error } = useListings();

  if (loading) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Loading listings…</p>;
  }

  if (error) {
    return <p className="py-12 text-center text-sm text-destructive">{error}</p>;
  }

  if (listings.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No listings match your filters yet — try widening your search.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};
