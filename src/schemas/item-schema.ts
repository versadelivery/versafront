import { z } from 'zod';

export const extraSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.number().min(0, "Preço deve ser maior ou igual a 0"),
});

export const prepareMethodSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export const stepOptionSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export const stepSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  options: z.array(stepOptionSchema),
});

export const itemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  catalog_group_id: z.string().min(1, "Grupo é obrigatório"),
  price: z.number().min(0, "Preço deve ser maior ou igual a 0"),
  priority: z.number().min(0, "Prioridade deve ser maior ou igual a 0"),
  item_type: z.enum(["unit", "weight"]),
  unit_of_measurement: z.enum(["kg", "g"]).optional(),
  min_weight: z.number().min(0, "Peso mínimo deve ser maior ou igual a 0").optional(),
  max_weight: z.number().min(0, "Peso máximo deve ser maior ou igual a 0").optional(),
  measure_interval: z.number().min(0, "Intervalo deve ser maior ou igual a 0").optional(),
  price_with_discount: z.union([
    z.number().min(0, "O preço com desconto deve ser positivo").optional(),
    z.literal('')
  ]).transform(val => val === '' ? '' : String(val)),
  image: z.any().optional(),
  removeImage: z.boolean().optional(),
  has_extras: z.boolean().optional(),
  catalog_item_extras_attributes: z.array(extraSchema).optional(),
  has_prepare_methods: z.boolean().optional(),
  catalog_item_prepare_methods_attributes: z.array(prepareMethodSchema).optional(),
  has_steps: z.boolean().optional(),
  catalog_item_steps_attributes: z.array(stepSchema).optional(),
}).refine((data) => {
  if (data.item_type === 'weight') {
    return data.unit_of_measurement && data.min_weight && data.max_weight && data.measure_interval;
  }
  return true;
}, {
  message: 'Preencha todos os campos de peso',
  path: ['unit_of_measurement'],
});

export type ItemFormValues = z.infer<typeof itemSchema>;