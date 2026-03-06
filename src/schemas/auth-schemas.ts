import { z } from "zod";

const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
const nameRegex = /^[a-zA-ZÀ-ÿ\s']+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{6,}$/;

export const registerStep1Schema = z.object({
  storeName: z.string()
    .min(3, "Nome da loja deve ter pelo menos 3 caracteres")
    .max(50, "Nome da loja não pode ter mais de 50 caracteres"),
  storePhone: z.string()
    .min(14, "Telefone inválido")
    .regex(phoneRegex, "Telefone inválido. Use o formato (xx) xxxxx-xxxx")
});

const baseStep2Schema = z.object({
  userName: z.string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(50, "Nome não pode ter mais de 50 caracteres")
    .regex(nameRegex, "Nome não pode conter números ou símbolos"),
  userEmail: z.string()
    .email("Email inválido")
    .max(100, "Email não pode ter mais de 100 caracteres"),
  userPassword: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(50, "Senha não pode ter mais de 50 caracteres")
    .regex(passwordRegex, "Senha deve conter 1 maiúscula, 1 número e 1 símbolo"),
  confirmPassword: z.string()
});

export const registerStep2Schema = baseStep2Schema.refine(
  data => data.userPassword === data.confirmPassword, 
  {
    message: "As senhas não coincidem",
    path: ["confirmPassword"]
  }
);

export const registerSchema = z.object({
  shop: z.object({
    name: z.string()
      .min(3, "Nome da loja deve ter pelo menos 3 caracteres")
      .max(50, "Nome da loja não pode ter mais de 50 caracteres"),
    cellphone: z.string()
      .min(14, "Telefone inválido")
      .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido. Use o formato (xx) xxxxx-xxxx")
  }),
  shop_user: z.object({
    name: z.string()
      .min(3, "Nome deve ter pelo menos 3 caracteres")
      .max(50, "Nome não pode ter mais de 50 caracteres")
      .regex(nameRegex, "Nome não pode conter números ou símbolos"),
    email: z.string()
      .min(1, "Email é obrigatório")
      .email("Email inválido")
      .max(100, "Email não pode ter mais de 100 caracteres"),
    password: z.string()
      .min(6, "Senha deve ter no mínimo 6 caracteres")
      .max(50, "Senha não pode ter mais de 50 caracteres"),
    confirmPassword: z.string()
  })
}).refine((data) => data.shop_user.password === data.shop_user.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["shop_user", "confirmPassword"]
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string()
    .email("Email inválido")
    .max(100, "Email não pode ter mais de 100 caracteres"),
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(50, "Senha não pode ter mais de 50 caracteres")
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email("Email inválido")
    .max(100, "Email não pode ter mais de 100 caracteres")
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(50, "Senha não pode ter mais de 50 caracteres"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;