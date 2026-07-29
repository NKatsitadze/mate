import { AdminShopStatusDialog } from '@/features/shops/components/admin-shop-status-dialog';
import { ShopResponse } from '@/features/shops/types/shop.types';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';

type AdminShopsListProps = {
  shops: ShopResponse[];
};

export const AdminShopsList = ({ shops }: AdminShopsListProps) => {
  if (shops.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No shops yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {shops.map((shop) => (
        <Card key={shop.id}>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-sm font-semibold">{shop.name}</h3>
              <Badge variant={shop.status === 'active' ? 'outline' : 'destructive'}>{shop.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{shop.address}</p>
            <p className="text-xs text-muted-foreground">{shop.phone}</p>
            <div className="pt-2">
              <AdminShopStatusDialog shopId={shop.id} currentStatus={shop.status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
