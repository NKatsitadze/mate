'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAddAllowedEmail } from '@/features/allowlist/hooks/use-add-allowed-email';
import { AddAllowedEmailSchema, AddAllowedEmailType } from '@/features/allowlist/validations/allowlist.validation';
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

export const AddAllowedEmailForm = () => {
  const { addAllowedEmail, loading, error } = useAddAllowedEmail();

  const form = useForm<AddAllowedEmailType>({
    resolver: zodResolver(AddAllowedEmailSchema),
    defaultValues: { email: '', note: '' },
  });

  const handleSubmit = async (data: AddAllowedEmailType) => {
    await addAllowedEmail(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="shop@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Note (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Referred by…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Adding…' : 'Add email'}
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </Form>
  );
};
