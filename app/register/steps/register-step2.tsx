"use client";

import { AuthFormInput } from "@/components/auth/auth-form-input";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthFormFooter } from "@/components/auth/auth-form-footer";
import { RegisterStep2Props } from "@/app/types";

export function RegisterStep2({ formData, handleChange, isLoading }: RegisterStep2Props) {
  return (
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

      <AuthButton 
        type="submit" 
        variant="primary"
        disabled={isLoading || !formData.userName || !formData.userEmail || !formData.userPassword}
      >
        {isLoading ? "CADASTRANDO..." : "CADASTRAR"}
      </AuthButton>
    </>
  );
}