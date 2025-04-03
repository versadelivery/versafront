import { z } from 'zod';

export const groupSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  priority: z.number().min(0).max(100),
  image: z.instanceof(File).optional(),
});

export type GroupFormValues = z.infer<typeof groupSchema>;