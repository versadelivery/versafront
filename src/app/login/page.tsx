"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import cesta from "../../../public/img/cesta.png";
import { loginSchema, LoginFormData } from "@/schemas/auth-schemas";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
    <AuthLayout 
      title="Faça Login para Iniciar" 
      imageSrc={cesta} 
      imagePosition="left"
    >
      <div className="w-full flex flex-col justify-center mb-4">
        <AuthFormInput
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          label="Email"
          error={errors.email}
        />
      </div>
      <div className="w-full flex flex-col justify-center mb-4">
        <AuthFormInput
          type="password"
          name="password"
          placeholder="Senha"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          label="Senha"
          error={errors.password}showPasswordToggle
        />
      </div>
      <Button
        type="submit"
        className="w-full mt-4 mb-4 text-lg font-bold py-8"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
      </Button>
      <p className="text-md text-center mt-4">
        Não tem uma conta? <Link href="/register" className="text-primary">Cadastre-se</Link>
      </p>
    </AuthLayout>
  );
}