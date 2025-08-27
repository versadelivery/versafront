"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AuthBreadcrumbProps } from "@/types/utils";

export function AuthBreadcrumb({ 
  currentStep, 
  setStep,
  isStepValid
}: AuthBreadcrumbProps) {
  const handleStepChange = (targetStep: number) => {
    if (targetStep < currentStep && isStepValid) {
      setStep(targetStep);
    }
  };

  return (
    <Breadcrumb className="mb-8 font-antarctican-mono">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink 
            href="#" 
            onClick={() => handleStepChange(1)}
            className={`font-bold text-xl ${currentStep === 1 ? "text-primary" : "text-foreground/40"} ${
              currentStep > 1 && isStepValid ? "cursor-pointer hover:underline" : "cursor-default"
            }`}
          >
            Estabelecimento
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink 
            href="#"
            onClick={() => handleStepChange(2)}
            className={`font-bold text-xl ${currentStep === 2 ? "text-primary" : "text-foreground/40"} cursor-default`}
          >
            Dados Pessoais
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}