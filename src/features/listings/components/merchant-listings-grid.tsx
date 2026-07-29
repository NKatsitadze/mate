'use client';
import Link from 'next/link';

import { DeleteListingDialog } from '@/features/listings/components/delete-listing-dialog';
import { MarkSoldDialog } from '@/features/listings/components/mark-sold-dialog';
import { ListingResponse } from '@/features/listings/types/listing.types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { LISTING_STATUS_TABS } from '@/shared/const/listings.const';

type MerchantListingsGridProps = {
  listings: ListingResponse[];
};

export const MerchantListingsGrid = ({ listings }: MerchantListingsGridProps) => {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your listings</h1>
        <Button asChild>
          <Link href="/dashboard/listings/new">+ New listing</Link>
        </Button>
      </header>

      <Tabs defaultValue="active">
        <TabsList>
          {LISTING_STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {LISTING_STATUS_TABS.map((tab) => {
          const filtered = listings.filter((listing) => listing.status === tab.value);

          return (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No listings here yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((listing) => (
                    <Card key={listing.id}>
                      <CardContent className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate text-sm font-semibold">{listing.title}</h3>
                          <Badge variant="outline">{listing.status}</Badge>
                        </div>
                        <p className="text-sm font-bold">{listing.discountPrice} GEL</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/listings/${listing.id}/edit`}>Edit</Link>
                          </Button>
                          {listing.status === 'active' && <MarkSoldDialog listingId={listing.id} />}
                          <DeleteListingDialog listingId={listing.id} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
