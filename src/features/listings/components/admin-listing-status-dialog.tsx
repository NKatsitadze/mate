'use client';
import { useAdminSetListingStatus } from '@/features/listings/hooks/use-admin-set-listing-status';
import { ConfirmActionDialog } from '@/shared/components/confirm-action-dialog';

type AdminListingStatusDialogProps = {
  listingId: string;
  status: 'active' | 'sold_out' | 'deactivated';
};

export const AdminListingStatusDialog = ({ listingId, status }: AdminListingStatusDialogProps) => {
  const { setStatus, loading } = useAdminSetListingStatus();
  const isDeactivated = status === 'deactivated';
  const nextStatus = isDeactivated ? 'active' : 'deactivated';

  return (
    <ConfirmActionDialog
      triggerLabel={isDeactivated ? 'Reactivate' : 'Deactivate'}
      triggerVariant={isDeactivated ? 'outline' : 'destructive'}
      title={isDeactivated ? 'Reactivate this listing?' : 'Deactivate this listing?'}
      description={
        isDeactivated
          ? 'It will become visible in public search results again.'
          : 'It will be hidden from public search and its own detail page immediately.'
      }
      confirmLabel={isDeactivated ? 'Reactivate' : 'Deactivate'}
      confirmingLabel="Saving…"
      confirmVariant={isDeactivated ? 'default' : 'destructive'}
      loading={loading}
      onConfirm={() => setStatus(listingId, nextStatus)}
    />
  );
};
