'use client';
import { ListingForm } from '@/features/listings/components/listing-form';
import { useCreateListing } from '@/features/listings/hooks/use-create-listing';

export const CreateListingPage = () => {
  const { createListing, loading, error } = useCreateListing();

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="text-2xl font-bold">New listing</h1>
      <div className="mt-6">
        <ListingForm mode="create" onSubmit={createListing} submitting={loading} error={error} />
      </div>
    </div>
  );
};
