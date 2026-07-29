'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { ShopImageUploader } from '@/features/shops/components/shop-image-uploader';
import { ShopLocationFields } from '@/features/shops/components/shop-location-fields';
import { CreateShopSchema, CreateShopType } from '@/features/shops/validations/shop.validation';
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
import { SHOP_CATEGORIES } from '@/shared/const/categories.const';

type ShopFormProps = {
  mode: 'onboarding' | 'edit';
  defaultValues?: Partial<CreateShopType>;
  onSubmit: (data: CreateShopType) => void | Promise<void>;
  submitting?: boolean;
  error?: string | null;
};

export const ShopForm = ({ mode, defaultValues, onSubmit, submitting, error }: ShopFormProps) => {
  const form = useForm<CreateShopType>({
    resolver: zodResolver(CreateShopSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      category: defaultValues?.category,
      description: defaultValues?.description ?? '',
      phone: defaultValues?.phone ?? '',
      address: defaultValues?.address ?? '',
      lat: defaultValues?.lat,
      lng: defaultValues?.lng,
      photo: defaultValues?.photo,
    },
  });

  const lat = useWatch({ control: form.control, name: 'lat' });
  const lng = useWatch({ control: form.control, name: 'lng' });
  const hasCoordinates = typeof lat === 'number' && typeof lng === 'number';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop name</FormLabel>
              <FormControl>
                <Input placeholder="Corner Grocery" {...field} />
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
                  {SHOP_CATEGORIES.map((option) => (
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+995 5XX XX XX XX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Street, district, Tbilisi" {...field} />
              </FormControl>
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
                <Textarea placeholder="A short line about your shop" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ShopLocationFields control={form.control} />

        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop photo (optional)</FormLabel>
              <FormControl>
                <ShopImageUploader value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting || !hasCoordinates}>
          {submitting ? 'Saving…' : mode === 'onboarding' ? 'Create shop' : 'Save changes'}
        </Button>
      </form>
    </Form>
  );
};
