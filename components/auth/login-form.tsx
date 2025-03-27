"use client";

import { AuthFormInput } from "./auth-form-input";
import { AuthButton } from "./auth-button";
import { AuthFormFooter } from "./auth-form-footer";
import { LoginFormProps } from "@/app/types/utils";

export function LoginForm({
  formData,
  handleChange,
  handleBlur,
  isLoading,
  onSubmit,
  errors,
  touched
}: LoginFormProps) {
  const isFormValid = 
    formData.email.includes('@') && 
    formData.password.length >= 6;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AuthFormInput
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="johndoe@mail.com"
        label="Email"
        error={touched?.email ? errors?.email : undefined}
      />

      <AuthFormInput
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="********"
        label="Senha"
        showPasswordToggle
        error={touched?.password ? errors?.password : undefined}
      />

      <AuthFormFooter isLogin />

      <AuthButton 
        type="submit" 
        variant="primary"
        disabled={isLoading || !isFormValid}
        isLoading={isLoading}
      >
        ACESSAR
      </AuthButton>
    </form>
  );
}