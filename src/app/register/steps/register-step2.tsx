"use client";

import { AuthFormInput } from "@/components/auth/auth-form-input";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthFormFooter } from "@/components/auth/auth-form-footer";
import { RegisterStep2Props } from "@/types/utils";

export function RegisterStep2({ 
  formData, 
  handleChange,
  handleBlur,
  isLoading,
  errors,
  touched
}: RegisterStep2Props & {
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  touched: Record<string, boolean>;
}) {
  const isFormValid = 
    formData.userName.length >= 3 &&
    formData.userEmail.includes('@') &&
    formData.userPassword.length >= 6 &&
    formData.userPassword === formData.confirmPassword;

  return (
    <>
      <AuthFormInput
        type="text"
        name="userName"
        value={formData.userName}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="João da Silva"
        label="Seu Nome"
        error={touched.userName ? errors.userName : undefined}
      />

      <AuthFormInput
        type="email"
        name="userEmail"
        value={formData.userEmail}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="johndoe@mail.com"
        label="Seu Email"
        error={touched.userEmail ? errors.userEmail : undefined}
      />

      <AuthFormInput
        type="password"
        name="userPassword"
        value={formData.userPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="********"
        label="Senha"
        showPasswordToggle
        error={touched.userPassword ? errors.userPassword : undefined}
      />

      <AuthFormInput
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="********"
        label="Confirmar Senha"
        showPasswordToggle
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
      />

      <AuthFormFooter />

      <AuthButton 
        type="submit" 
        variant="primary"
        disabled={isLoading || !isFormValid}
        isLoading={isLoading}
      >
        CADASTRAR
      </AuthButton>
    </>
  );
}