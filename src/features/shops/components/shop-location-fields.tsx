'use client';
import { useEffect, useState } from 'react';
import { type Control, useFormContext, useWatch } from 'react-hook-form';

import { CreateShopType } from '@/features/shops/validations/shop.validation';
import { Button } from '@/shared/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { useGeolocation } from '@/shared/hooks/use-geolocation';

type ShopLocationFieldsProps = {
  control: Control<CreateShopType>;
};

export const ShopLocationFields = ({ control }: ShopLocationFieldsProps) => {
  const { setValue } = useFormContext<CreateShopType>();
  const { coordinates, loading: locating, error: locationError, requestLocation } = useGeolocation();
  const [showManualCoords, setShowManualCoords] = useState(false);

  const lat = useWatch({ control, name: 'lat' });
  const lng = useWatch({ control, name: 'lng' });
  const hasCoordinates = typeof lat === 'number' && typeof lng === 'number';

  useEffect(() => {
    if (coordinates) {
      setValue('lat', coordinates.lat, { shouldValidate: true });
      setValue('lng', coordinates.lng, { shouldValidate: true });
    }
  }, [coordinates, setValue]);

  const manualCoordsVisible = showManualCoords || Boolean(locationError);

  return (
    <div className="space-y-2 rounded-md border border-border p-4">
      <p className="text-sm font-medium">Shop location</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={requestLocation} disabled={locating}>
          {locating ? 'Locating…' : 'Use my current location'}
        </Button>
        {hasCoordinates && (
          <span className="text-sm text-muted-foreground">
            Location captured ({lat.toFixed(4)}, {lng.toFixed(4)})
          </span>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowManualCoords((current) => !current)}>
          {manualCoordsVisible ? 'Hide manual entry' : 'Enter coordinates manually'}
        </Button>
      </div>
      {locationError && (
        <p className="text-sm text-destructive">
          Couldn&apos;t get your location automatically — enter coordinates manually below.
        </p>
      )}
      {manualCoordsVisible && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <FormField
            control={control}
            name="lat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="any"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="lng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="any"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};
