'use client';
import { useState } from 'react';

import { ShopForm } from '@/features/shops/components/shop-form';
import { useUpdateShop } from '@/features/shops/hooks/use-update-shop';
import { ShopResponse } from '@/features/shops/types/shop.types';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';

type EditShopDialogProps = {
  shop: ShopResponse;
};

export const EditShopDialog = ({ shop }: EditShopDialogProps) => {
  const [open, setOpen] = useState(false);
  const { updateShop, loading, error } = useUpdateShop(() => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit shop
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit shop details</DialogTitle>
        </DialogHeader>
        <ShopForm
          mode="edit"
          defaultValues={{
            name: shop.name,
            category: shop.category,
            description: shop.description,
            phone: shop.phone,
            address: shop.address,
            lat: shop.lat,
            lng: shop.lng,
            photo: shop.photo,
          }}
          onSubmit={updateShop}
          submitting={loading}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
};
