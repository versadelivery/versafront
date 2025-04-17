"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/app/components/auth/auth-layout";
import { LoginForm } from "@/app/components/auth/login-form";
import cesta from "@/public/img/cesta.png";
import { loginSchema, LoginFormData } from "@/app/schemas/auth-schemas";
import { useAuth } from "../hooks/use-auth";
import { z } from "zod";

export default function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateForm();
  };

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<LoginFormData> = {};
        error.errors.forEach(err => {
          const path = err.path[0] as keyof LoginFormData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      await login({email: formData.email, password: formData.password});
      toast.success("Login realizado com sucesso!");
    } catch (error) {
      toast.error("Credenciais inválidas. Por favor, tente novamente.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Faça Login para Iniciar" 
      imageSrc={cesta} 
      imagePosition="left"
    >
      <LoginForm
        formData={formData}
        handleChange={handleChange}
        handleBlur={handleBlur}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        errors={errors}
        touched={touched}
      />
    </AuthLayout>
  );
}