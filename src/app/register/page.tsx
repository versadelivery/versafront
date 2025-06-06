"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthBreadcrumb } from "@/components/auth/auth-breadcrumb";
import { RegisterForm } from "@/components/auth/register-form";
import cesta from "../../../public/img/breads.png";
import { registerShop } from "@/services/auth-service";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { registerStep1Schema, registerStep2Schema, RegisterFormData } from "@/schemas/auth-schemas";
import { z } from "zod";
import { formatPhone } from "@/utils/format-phone";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    storeName: "",
    storePhone: "",
    userName: "",
    userEmail: "",
    userPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const filteredValue = value.replace(/[^a-zA-ZÀ-ÿ\s']/g, '');
    setFormData(prev => ({
      ...prev,
      [name]: filteredValue
    }));
    
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedValue = formatPhone(value);
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    if (errors.storePhone) {
      setErrors(prev => ({ ...prev, storePhone: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateStep(step);
  };

  const validateStep = (step: number) => {
    try {
      if (step === 1) {
        registerStep1Schema.parse(formData);
      } else {
        registerStep2Schema.parse(formData);
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<RegisterFormData> = {};
        error.errors.forEach(err => {
          const path = err.path[0] as keyof RegisterFormData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const nextStep = () => {
    if (validateStep(1)) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(2)) return;
    
    if (formData.userPassword !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "As senhas não coincidem" }));
      return;
    }

    setIsLoading(true);

    const payload = {
      shop: {
        name: formData.storeName,
        cellphone: formData.storePhone.replace(/\D/g, ''),
      },
      shop_user: {
        name: formData.userName,
        email: formData.userEmail,
        password: formData.userPassword,
      },
    };

    try {
      await register(payload);
      toast.success("Cadastro realizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao cadastrar. Por favor, tente novamente.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCurrentStep = () => {
    if (step === 1) {
      return formData.storeName.length >= 3 && 
             formData.storePhone.replace(/\D/g, '').length >= 10;
    }
    return true;
  };

  return (
    <AuthLayout title="Cadastre-se na plataforma" imageSrc={cesta}>
      <AuthBreadcrumb 
        currentStep={step} 
        setStep={setStep} 
        isStepValid={validateCurrentStep()} 
      />
      
      <RegisterForm
        step={step}
        formData={formData}
        handleChange={handleChange}
        handleNameChange={handleNameChange}
        handlePhoneChange={handlePhoneChange}
        handleBlur={handleBlur}
        nextStep={nextStep}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        errors={errors}
        touched={touched}
      />
    </AuthLayout>
  );
}