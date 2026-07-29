import { AdminShopsList } from '@/features/shops/components/admin-shops-list';
import { listAllShopsService } from '@/features/shops/service/shop.service';

export default async function AdminShopsPage() {
  const shopsResult = await listAllShopsService(1, 100);
  const shops = 'error' in shopsResult.data ? [] : shopsResult.data.items;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Admin</p>
        <h1 className="mt-1 text-2xl font-bold">Shops</h1>
      </div>
      <AdminShopsList shops={shops} />
    </div>
  );
}
