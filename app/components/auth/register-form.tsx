"use client";

import { RegisterStep1 } from "../../register/steps/register-step1";
import { RegisterStep2 } from "../../register/steps/register-step2";
import { RegisterFormProps } from "@/app/types/utils";

export function RegisterForm({
  step,
  formData,
  handleChange,
  handleNameChange,
  handlePhoneChange,
  handleBlur,
  nextStep,
  isLoading,
  onSubmit,
  errors,
  touched
}: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {step === 1 ? (
        <RegisterStep1 
          formData={formData} 
          handleChange={handleNameChange}
          handlePhoneChange={handlePhoneChange}
          handleBlur={handleBlur}
          nextStep={nextStep}
          errors={errors}
          touched={touched}
        />
      ) : (
        <RegisterStep2 
          formData={formData} 
          handleChange={handleChange}
          handleBlur={handleBlur}
          isLoading={isLoading}
          errors={errors}
          touched={touched}
        />
      )}
    </form>
  );
}