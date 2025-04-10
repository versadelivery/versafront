import { z } from 'zod'

export const loginSchema = z.object({
  customer: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres')
  })
})

export const registerSchema = z.object({
  customer: z.object({
    name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    cellphone: z.string().regex(/^[0-9]{11}$/, 'Celular inválido')
  })
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema> 