import { z } from 'zod';

export const itemSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  groupId: z.string().min(1, 'Selecione um grupo'),
  price: z.number().min(0, 'Preço deve ser maior que 0'),
  priority: z.number().min(0).max(100),
  unitType: z.enum(['unit', 'weight'], {
    required_error: 'Selecione o tipo de unidade',
  }),
  weightUnit: z.enum(['kg', 'g']).optional(),
  weightPerKg: z.number().min(0).optional(),
  minWeight: z.number().min(0).optional(),
  maxWeight: z.number().min(0).optional(),
  weightInterval: z.number().min(0).optional(),
  image: z.union([z.instanceof(File), z.literal('')]).optional(),
  removeImage: z.boolean().optional(),
}).refine((data) => {
  if (data.unitType === 'weight') {
    return data.weightUnit && data.weightPerKg && data.minWeight && data.maxWeight && data.weightInterval;
  }
  return true;
}, {
  message: 'Preencha todos os campos de peso',
  path: ['weightUnit'],
});

export type ItemFormValues = z.infer<typeof itemSchema>;