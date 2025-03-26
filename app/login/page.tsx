"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthFormInput } from "@/components/auth/auth-form-input";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthFormFooter } from "@/components/auth/auth-form-footer";
import cesta from "@/public/img/cesta.png";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <AuthLayout 
      title="Faça Login para Iniciar" 
      imageSrc={cesta} 
      imagePosition="left"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthFormInput
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="johndoe@mail.com"
          label="Email"
        />

        <AuthFormInput
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="********"
          label="Senha"
          showPasswordToggle
        />

        <AuthFormFooter isLogin />

        <AuthButton type="submit" variant="primary">
          ACESSAR
        </AuthButton>
      </form>
    </AuthLayout>
  );
}