"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/schemas/auth-schemas";
import { z } from "zod";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { AuthFormInput } from "@/components/auth/auth-form-input";
import { forgotPassword } from "@/services/auth-service";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: ""
  });
  const [errors, setErrors] = useState<Partial<ForgotPasswordFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof ForgotPasswordFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const validatedData = forgotPasswordSchema.parse(formData);
      await forgotPassword(validatedData.email);
      setIsSuccess(true);
      toast.success("E-mail enviado com sucesso!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Partial<ForgotPasswordFormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as keyof ForgotPasswordFormData] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        toast.error("Erro ao enviar e-mail. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout title="E-mail Enviado">
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="w-16 h-16 text-[#009246] mb-4" />
          <p className="text-[#474747] mb-6">
            Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.
          </p>
          <p className="text-[#858585] text-sm mb-6">
            Verifique sua caixa de entrada e spam.
          </p>
          <Link href="/login">
            <button className="bg-[#1B1B1B] hover:bg-black text-white text-base font-medium px-8 py-4 rounded-2xl transition-colors cursor-pointer flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para o Login
            </button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Esqueceu sua senha?">
      <p className="text-[#858585] text-center mb-6 -mt-4">
        Digite seu e-mail e enviaremos instruções para redefinir sua senha.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthFormInput
          type="email"
          name="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          label="Email"
          error={errors.email}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1B1B1B] hover:bg-black text-white text-base font-medium py-4 rounded-2xl transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Enviar"}
        </button>
      </form>
      <p className="text-sm text-[#858585] text-center mt-6">
        <Link href="/login" className="text-[#009246] font-medium hover:underline inline-flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Login
        </Link>
      </p>
    </AuthLayout>
  );
}
