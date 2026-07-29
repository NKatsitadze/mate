import { ShopResponse } from '@/features/shops/types/shop.types';
import { Card, CardContent } from '@/shared/components/ui/card';

type ListingShopInfoCardProps = {
  shop: ShopResponse;
};

export const ListingShopInfoCard = ({ shop }: ListingShopInfoCardProps) => {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`;

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="text-sm font-semibold">{shop.name}</p>
        <p className="text-sm text-muted-foreground">{shop.address}</p>
        <a href={`tel:${shop.phone}`} className="block text-sm text-primary hover:underline">
          {shop.phone}
        </a>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          Get directions
        </a>
        <div className="overflow-hidden rounded-lg border">
          <iframe
            src={`https://www.google.com/maps?q=${shop.lat},${shop.lng}&output=embed`}
            className="h-64 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map showing location of ${shop.name}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};
