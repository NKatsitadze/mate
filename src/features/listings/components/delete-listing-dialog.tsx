'use client';
import { useDeleteListing } from '@/features/listings/hooks/use-delete-listing';
import { ConfirmActionDialog } from '@/shared/components/confirm-action-dialog';

type DeleteListingDialogProps = {
  listingId: string;
};

export const DeleteListingDialog = ({ listingId }: DeleteListingDialogProps) => {
  const { deleteListing, loading } = useDeleteListing();

  return (
    <ConfirmActionDialog
      triggerLabel="Delete"
      triggerClassName="text-destructive hover:text-destructive"
      title="Delete this listing?"
      description="This cannot be undone."
      confirmLabel="Delete"
      confirmingLabel="Deleting…"
      confirmVariant="destructive"
      loading={loading}
      onConfirm={() => deleteListing(listingId)}
    />
  );
};
