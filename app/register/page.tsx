"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthFormInput } from "@/components/auth/auth-form-input";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthFormFooter } from "@/components/auth/auth-form-footer";
import { AuthBreadcrumb } from "@/components/auth/auth-breadcrumb";
import cesta from "@/public/img/breads.png";

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    storeName: "",
    storePhone: "",
    userName: "",
    userEmail: "",
    userPassword: ""
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

  const nextStep = () => setStep(2);

  return (
    <AuthLayout title="Cadastre-se na plataforma" imageSrc={cesta}>
      <AuthBreadcrumb currentStep={step} setStep={setStep} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 ? (
          <>
            <AuthFormInput
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              placeholder="Minha Loja"
              label="Nome da Loja"
            />

            <AuthFormInput
              type="tel"
              name="storePhone"
              value={formData.storePhone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              label="Telefone da Loja"
            />

            <AuthFormFooter />

            <AuthButton 
              type="button"
              onClick={nextStep}
              variant="secondary"
              withArrow
            >
              Próximo
            </AuthButton>
          </>
        ) : (
          <>
            <AuthFormInput
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="João da Silva"
              label="Seu Nome"
            />

            <AuthFormInput
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              placeholder="johndoe@mail.com"
              label="Seu Email"
            />

            <AuthFormInput
              type="password"
              name="userPassword"
              value={formData.userPassword}
              onChange={handleChange}
              placeholder="********"
              label="Senha"
              showPasswordToggle
            />

            <AuthFormFooter />

            <AuthButton type="submit" variant="primary">
              CADASTRAR
            </AuthButton>
          </>
        )}
      </form>
    </AuthLayout>
  );
}