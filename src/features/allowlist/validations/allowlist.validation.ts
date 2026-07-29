import { z } from 'zod';

export const AddAllowedEmailSchema = z.object({
  email: z.string().email(),
  note: z.string().max(300).optional(),
});

export type AddAllowedEmailType = z.infer<typeof AddAllowedEmailSchema>;
