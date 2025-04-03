import { z } from 'zod';

const baseItemSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  catalog_group_id: z.string().min(1, 'Grupo é obrigatório'),
  item_type: z.enum(['unit', 'weight']),
  price: z.string().min(1, 'Preço é obrigatório'),
  priority: z.string().min(1, 'Prioridade é obrigatória'),
  price_with_discount: z.string().optional(),
  image: z.union([z.instanceof(File), z.string()]).optional(),
});



export const itemSchema = baseItemSchema
  .extend({
    item_type: z.literal('weight'),
    unit_of_measurement: z.enum(['kg', 'g']).default('kg'),
    measure_interval: z.string().optional(),
    min_weight: z.string().optional(),
    max_weight: z.string().optional(),
  })
  .or(baseItemSchema.extend({
    item_type: z.literal('unit'),
  }));

export type ItemFormValues = z.infer<typeof itemSchema>;