"use client";

import { RegisterStep1 } from "../../app/register/steps/register-step1";
import { RegisterStep2 } from "../../app/register/steps/register-step2";
import { RegisterFormProps } from "@/app/types";

export function RegisterForm({
  step,
  formData,
  handleChange,
  nextStep,
  isLoading,
  onSubmit
}: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {step === 1 ? (
        <RegisterStep1 
          formData={formData} 
          handleChange={handleChange} 
          nextStep={nextStep} 
        />
      ) : (
        <RegisterStep2 
          formData={formData} 
          handleChange={handleChange} 
          isLoading={isLoading} 
        />
      )}
    </form>
  );
}