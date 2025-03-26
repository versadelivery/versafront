"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import cesta from "@/public/img/cesta.png";
import { loginUser } from "../services/auth-service";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginUser(formData);
      localStorage.setItem("authToken", response.token);
      toast.success("Login realizado com sucesso!");
      router.push("/");
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
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}