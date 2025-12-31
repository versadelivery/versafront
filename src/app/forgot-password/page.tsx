"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import cesta from "../../../public/img/cesta.png";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/schemas/auth-schemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
      <AuthLayout
        title="E-mail Enviado"
        imageSrc={cesta}
        imagePosition="left"
      >
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <p className="text-gray-600 mb-6">
            Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Verifique sua caixa de entrada e spam.
          </p>
          <Link href="/login">
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Esqueceu sua senha?"
      imageSrc={cesta}
      imagePosition="left"
    >
      <p className="text-gray-600 text-center mb-6">
        Digite seu e-mail e enviaremos instruções para redefinir sua senha.
      </p>
      <div className="w-full flex flex-col justify-center mb-4">
        <AuthFormInput
          type="email"
          name="email"
          placeholder="Digite seu e-mail"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          label="Email"
          error={errors.email}
        />
      </div>
      <Button
        type="submit"
        className="w-full mt-4 mb-4 text-lg font-bold py-8"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar"}
      </Button>
      <p className="text-md text-center mt-4">
        <Link href="/login" className="text-primary flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Login
        </Link>
      </p>
    </AuthLayout>
  );
}
