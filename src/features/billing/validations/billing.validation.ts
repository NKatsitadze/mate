import { z } from 'zod';

export const CreateCheckoutSessionSchema = z.object({
  plan: z.enum(['pro', 'premium']),
});

export type CreateCheckoutSessionType = z.infer<typeof CreateCheckoutSessionSchema>;
