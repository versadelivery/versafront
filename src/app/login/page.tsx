"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { loginSchema, LoginFormData } from "@/schemas/auth-schemas";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AuthFormInput } from "@/components/auth/auth-form-input";

export default function Login() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const validatedData = loginSchema.parse(formData);
      await login(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Partial<LoginFormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        console.error(error)
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Faça login na sua conta">
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
        <AuthFormInput
          type="password"
          name="password"
          placeholder="Sua senha"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          label="Senha"
          error={errors.password}
          showPasswordToggle
        />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-[#009246] hover:underline">
            Esqueceu sua senha?
          </Link>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1B1B1B] hover:bg-black text-white text-base font-medium py-4 rounded-2xl transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Entrar"}
        </button>
      </form>
      <p className="text-sm text-[#858585] text-center mt-6">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-[#009246] font-medium hover:underline">
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  );
}
