"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { resetPasswordSchema, ResetPasswordFormData } from "@/schemas/auth-schemas";
import { z } from "zod";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { AuthFormInput } from "@/components/auth/auth-form-input";
import { resetPassword } from "@/services/auth-service";
import { toast } from "sonner";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});

  useEffect(() => {
    if (!token) {
      toast.error("Token inválido ou ausente");
      router.push("/login");
    }
  }, [token, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof ResetPasswordFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    try {
      const validatedData = resetPasswordSchema.parse(formData);
      await resetPassword({
        token,
        password: validatedData.password,
        password_confirmation: validatedData.confirmPassword
      });
      setIsSuccess(true);
      toast.success("Senha alterada com sucesso!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Partial<ResetPasswordFormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as keyof ResetPasswordFormData] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        toast.error(axiosError.response?.data?.error || "Erro ao redefinir senha");
      } else {
        toast.error("Erro ao redefinir senha. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Link Inválido">
        <div className="flex flex-col items-center text-center">
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-[#474747] mb-6">
            O link de recuperação de senha é inválido ou expirou.
          </p>
          <Link href="/forgot-password">
            <button className="bg-[#1B1B1B] hover:bg-black text-white text-base font-medium px-8 py-4 rounded-2xl transition-colors cursor-pointer">
              Solicitar novo link
            </button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Senha Alterada!">
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="w-16 h-16 text-[#009246] mb-4" />
          <p className="text-[#474747] mb-6">
            Sua senha foi alterada com sucesso. Você já pode fazer login com a nova senha.
          </p>
          <Link href="/login">
            <button className="bg-[#1B1B1B] hover:bg-black text-white text-base font-medium px-8 py-4 rounded-2xl transition-colors cursor-pointer">
              Ir para o Login
            </button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Redefinir Senha">
      <p className="text-[#858585] text-center mb-6 -mt-4">
        Digite sua nova senha abaixo.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthFormInput
          type="password"
          name="password"
          placeholder="Nova senha"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          label="Nova Senha"
          error={errors.password}
          showPasswordToggle
        />
        <AuthFormInput
          type="password"
          name="confirmPassword"
          placeholder="Confirme a nova senha"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isLoading}
          label="Confirmar Senha"
          error={errors.confirmPassword}
          showPasswordToggle
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1B1B1B] hover:bg-black text-white text-base font-medium py-4 rounded-2xl transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Redefinir Senha"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <AuthLayout title="Carregando...">
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#858585]" />
        </div>
      </AuthLayout>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
