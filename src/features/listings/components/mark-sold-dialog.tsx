'use client';
import { useUpdateListingStatus } from '@/features/listings/hooks/use-update-listing-status';
import { ConfirmActionDialog } from '@/shared/components/confirm-action-dialog';

type MarkSoldDialogProps = {
  listingId: string;
};

export const MarkSoldDialog = ({ listingId }: MarkSoldDialogProps) => {
  const { updateStatus, loading } = useUpdateListingStatus();

  return (
    <ConfirmActionDialog
      triggerLabel="Mark sold"
      title="Mark this listing as sold?"
      description="It will no longer show up in public search results."
      confirmLabel="Mark sold"
      confirmingLabel="Saving…"
      loading={loading}
      onConfirm={() => updateStatus(listingId, 'sold_out')}
    />
  );
};
