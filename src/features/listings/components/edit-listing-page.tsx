'use client';
import { ListingForm } from '@/features/listings/components/listing-form';
import { useUpdateListing } from '@/features/listings/hooks/use-update-listing';
import { ListingResponse } from '@/features/listings/types/listing.types';

type EditListingPageProps = {
  listing: ListingResponse;
};

export const EditListingPage = ({ listing }: EditListingPageProps) => {
  const { updateListing, loading, error } = useUpdateListing(listing.id);

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="text-2xl font-bold">Edit listing</h1>
      <div className="mt-6">
        <ListingForm
          mode="edit"
          defaultValues={{
            title: listing.title,
            description: listing.description,
            category: listing.category,
            originalPrice: listing.originalPrice,
            discountPrice: listing.discountPrice,
            quantityAvailable: listing.quantityAvailable,
            images: listing.images,
          }}
          onSubmit={updateListing}
          submitting={loading}
          error={error}
        />
      </div>
    </div>
  );
};
