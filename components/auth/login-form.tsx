"use client";

import { AuthFormInput } from "./auth-form-input";
import { AuthButton } from "./auth-button";
import { AuthFormFooter } from "./auth-form-footer";
import { LoginFormProps } from "@/app/types";

export function LoginForm({
  formData,
  handleChange,
  isLoading,
  onSubmit
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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

      <AuthButton 
        type="submit" 
        variant="primary"
        disabled={isLoading || !formData.email || !formData.password}
      >
        {isLoading ? "ACESSANDO..." : "ACESSAR"}
      </AuthButton>
    </form>
  );
}