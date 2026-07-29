'use client';
import { useAdminUpdateShopStatus } from '@/features/shops/hooks/use-admin-update-shop-status';
import { ShopResponse } from '@/features/shops/types/shop.types';
import { ConfirmActionDialog } from '@/shared/components/confirm-action-dialog';

type AdminShopStatusDialogProps = {
  shopId: string;
  currentStatus: ShopResponse['status'];
};

export const AdminShopStatusDialog = ({ shopId, currentStatus }: AdminShopStatusDialogProps) => {
  const { updateStatus, loading } = useAdminUpdateShopStatus();
  const isActive = currentStatus === 'active';
  const nextStatus = isActive ? 'suspended' : 'active';

  return (
    <ConfirmActionDialog
      triggerLabel={isActive ? 'Suspend' : 'Reactivate'}
      triggerVariant={isActive ? 'destructive' : 'outline'}
      title={isActive ? 'Suspend this shop?' : 'Reactivate this shop?'}
      description={
        isActive
          ? 'This hides the shop and all of its active listings from public view.'
          : 'This lets the shop appear publicly again. Its listings stay deactivated until reviewed individually.'
      }
      confirmLabel={isActive ? 'Suspend' : 'Reactivate'}
      confirmingLabel="Saving…"
      confirmVariant={isActive ? 'destructive' : 'default'}
      loading={loading}
      onConfirm={() => updateStatus(shopId, nextStatus)}
    />
  );
};
