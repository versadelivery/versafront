"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthBreadcrumb } from "@/components/auth/auth-breadcrumb";
import { RegisterForm } from "@/components/auth/register-form";
import cesta from "@/public/img/breads.png";
import { registerShop } from "../services/auth-service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
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

  const nextStep = () => setStep(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      shop: {
        name: formData.storeName,
        cellphone: formData.storePhone,
      },
      shop_user: {
        name: formData.userName,
        email: formData.userEmail,
        password: formData.userPassword,
      },
    };

    try {
      await registerShop(payload);
      toast.success("Cadastro realizado com sucesso!");
      router.push("/login");
    } catch (error) {
      toast.error("Erro ao cadastrar. Por favor, tente novamente.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCurrentStep = () => {
    if (step === 1) {
      return formData.storeName.trim() !== "" && formData.storePhone.trim() !== "";
    }
    return true;
  };

  return (
    <AuthLayout title="Cadastre-se na plataforma" imageSrc={cesta}>
      <AuthBreadcrumb currentStep={step} setStep={setStep} isStepValid={validateCurrentStep()} />
      
      <RegisterForm
        step={step}
        formData={formData}
        handleChange={handleChange}
        nextStep={nextStep}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}