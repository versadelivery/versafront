"use client";

import { AuthFormInput } from "@/components/auth/auth-form-input";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthFormFooter } from "@/components/auth/auth-form-footer";
import { RegisterStep1Props } from "@/types/utils";

export function RegisterStep1({ 
  formData, 
  handleChange,
  handlePhoneChange,
  handleBlur,
  nextStep,
  errors,
  touched
}: RegisterStep1Props & {
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  touched: Record<string, boolean>;
}) {
  const isFormValid = 
    formData.storeName.length >= 3 && 
    formData.storePhone.replace(/\D/g, '').length >= 10;

  return (
    <>
      <AuthFormInput
        type="text"
        name="storeName"
        value={formData.storeName}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Minha Loja"
        label="Nome da Loja"
        error={touched.storeName ? errors.storeName : undefined}
      />

      <AuthFormInput
        type="tel"
        name="storePhone"
        value={formData.storePhone}
        onChange={handlePhoneChange}
        onBlur={handleBlur}
        placeholder="(00) 00000-0000"
        label="Telefone da Loja"
        error={touched.storePhone ? errors.storePhone : undefined}
      />

      <AuthFormFooter />

      <AuthButton 
        type="button"
        onClick={nextStep}
        variant="secondary"
        withArrow
        disabled={!isFormValid}
        isLoading={false}
      >
        Próximo
      </AuthButton>
    </>
  );
}