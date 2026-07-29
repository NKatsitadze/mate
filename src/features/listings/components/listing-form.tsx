'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { ListingImageUploader } from '@/features/listings/components/listing-image-uploader';
import { ListingPricingFields } from '@/features/listings/components/listing-pricing-fields';
import { CreateListingSchema, CreateListingType } from '@/features/listings/validations/listing.validation';
import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { LISTING_CATEGORIES } from '@/shared/const/categories.const';

type ListingFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateListingType>;
  onSubmit: (data: CreateListingType) => void | Promise<void>;
  submitting?: boolean;
  error?: string | null;
};

export const ListingForm = ({ mode, defaultValues, onSubmit, submitting, error }: ListingFormProps) => {
  const form = useForm<CreateListingType>({
    resolver: zodResolver(CreateListingSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      category: defaultValues?.category,
      originalPrice: defaultValues?.originalPrice,
      discountPrice: defaultValues?.discountPrice,
      quantityAvailable: defaultValues?.quantityAvailable ?? 1,
      listingDurationDays: defaultValues?.listingDurationDays ?? 7,
      images: defaultValues?.images ?? [],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Discounted sofa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LISTING_CATEGORIES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="A short description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ListingPricingFields control={form.control} />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photos</FormLabel>
              <FormControl>
                <ListingImageUploader value={field.value ?? []} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Saving…' : mode === 'create' ? 'Publish listing' : 'Save changes'}
        </Button>
      </form>
    </Form>
  );
};
