"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
// import { useRouter } from "next/navigation";

interface AuthBreadcrumbProps {
  currentStep: number;
  setStep: (step: number) => void;
}

export function AuthBreadcrumb({ currentStep, setStep }: AuthBreadcrumbProps) {
  return (
    <Breadcrumb className="mb-8 font-antarctican-mono">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink 
            href="#" 
            onClick={() => setStep(1)}
            className={`font-bold text-xl ${currentStep === 1 ? "font-bold text-primary" : "text-foreground/40"}`}
          >
            Estabelecimento
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink 
            href="#" 
            onClick={() => setStep(2)}
            className={`font-bold text-xl ${currentStep === 2 ? "font-bold text-primary" : "text-foreground/40"}`}
          >
            Dados Pessoais
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}