"use client";

import { AuthFormInput } from "@/components/auth/auth-form-input";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthFormFooter } from "@/components/auth/auth-form-footer";
import { RegisterStep1Props } from "@/app/types";

export function RegisterStep1({ formData, handleChange, nextStep }: RegisterStep1Props) {
  return (
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
        disabled={!formData.storeName || !formData.storePhone}
      >
        Próximo
      </AuthButton>
    </>
  );
}