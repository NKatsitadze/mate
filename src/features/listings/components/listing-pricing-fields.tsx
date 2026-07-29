import { type Control } from 'react-hook-form';

import { CreateListingType } from '@/features/listings/validations/listing.validation';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { LISTING_DURATION_OPTIONS } from '@/shared/const/listings.const';

type ListingPricingFieldsProps = {
  control: Control<CreateListingType>;
};

export const ListingPricingFields = ({ control }: ListingPricingFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="originalPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Original price (GEL)</FormLabel>
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
          name="discountPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount price (GEL)</FormLabel>
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="quantityAvailable"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity available</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
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
          name="listingDurationDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Listing duration</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LISTING_DURATION_OPTIONS.map((days) => (
                    <SelectItem key={days} value={String(days)}>
                      {days} day{days > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
