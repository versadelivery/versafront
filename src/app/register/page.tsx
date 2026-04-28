"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthFormInput } from "@/components/auth/auth-form-input";
import { useState } from "react";
import { registerSchema, registerStep1Schema, registerStep3Schema, RegisterFormData } from "@/schemas/auth-schemas";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { formatPhone } from "@/utils/format-phone";
import { formatDocument } from "@/utils/format-document";
import { useAuth } from "@/hooks/use-auth";
import { isAxiosError } from "axios";
import { toast } from "sonner";

type RegisterStateErrors = {
  shop?: Partial<RegisterFormData["shop"]>;
  shop_user?: Partial<RegisterFormData["shop_user"]>;
  shop_billing_config?: Partial<RegisterFormData["shop_billing_config"]>;
};

type BackendErrorDescriptor =
  | { section: "shop"; field: keyof RegisterFormData["shop"]; message: string }
  | { section: "shop_user"; field: keyof RegisterFormData["shop_user"]; message: string };

const BACKEND_ERROR_MAP: Record<string, BackendErrorDescriptor> = {
  "Cellphone has already been taken": {
    section: "shop",
    field: "cellphone",
    message: "Este celular já está em uso"
  },
  "Cellphone can't be blank": {
    section: "shop",
    field: "cellphone",
    message: "Celular é obrigatório"
  },
  "Cellphone is too short (minimum is 10 characters)": {
    section: "shop",
    field: "cellphone",
    message: "Celular deve ter no mínimo 10 dígitos"
  },
  "Name has already been taken": {
    section: "shop",
    field: "name",
    message: "Nome do estabelecimento já está em uso"
  },
  "Name can't be blank": {
    section: "shop_user",
    field: "name",
    message: "Nome é obrigatório"
  },
  "Email has already been taken": {
    section: "shop_user",
    field: "email",
    message: "Email já está em uso"
  },
  "Email can't be blank": {
    section: "shop_user",
    field: "email",
    message: "Email é obrigatório"
  },
  "Email is invalid": {
    section: "shop_user",
    field: "email",
    message: "Email inválido"
  },
  "Password can't be blank": {
    section: "shop_user",
    field: "password",
    message: "Senha é obrigatória"
  },
  "Password is too short (minimum is 6 characters)": {
    section: "shop_user",
    field: "password",
    message: "Senha deve ter no mínimo 6 caracteres"
  }
};

const stripValidationPrefix = (message: string) =>
  message.replace(/^Validation failed:\s*/i, "").trim();

const extractBackendMessages = (message: string) => {
  const stripped = stripValidationPrefix(message);
  return stripped.split(/,\s*/).map((entry) => entry.trim()).filter(Boolean);
};

const mapMessagesToFieldErrors = (messages: string[]): RegisterStateErrors => {
  return messages.reduce<RegisterStateErrors>((acc, current) => {
    const descriptor = BACKEND_ERROR_MAP[current];
    if (!descriptor) {
      return acc;
    }

    if (descriptor.section === "shop") {
      acc.shop = {
        ...(acc.shop ?? {}),
        [descriptor.field]: descriptor.message
      };
    } else {
      acc.shop_user = {
        ...(acc.shop_user ?? {}),
        [descriptor.field]: descriptor.message
      };
    }

    return acc;
  }, {});
};

const getApiErrorMessage = (error: unknown): string | null => {
  if (isAxiosError(error)) {
    const apiError = error.response?.data?.error;
    if (typeof apiError === "string") {
      return apiError;
    }
    if (Array.isArray(apiError)) {
      return apiError.join(", ");
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return null;
};

export default function Register() {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    shop: {
      name: "",
      cellphone: ""
    },
    shop_user: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
    shop_billing_config: {
      document: "",
      billing_email: ""
    }
  });
  const [errors, setErrors] = useState<RegisterStateErrors>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const applyBackendErrors = (fieldErrors: RegisterStateErrors) => {
    if (!fieldErrors.shop && !fieldErrors.shop_user) {
      return false;
    }

    setErrors(prev => ({
      ...prev,
      ...(fieldErrors.shop
        ? { shop: { ...(prev.shop ?? {}), ...fieldErrors.shop } }
        : {}),
      ...(fieldErrors.shop_user
        ? { shop_user: { ...(prev.shop_user ?? {}), ...fieldErrors.shop_user } }
        : {})
    }));

    return true;
  };

  const validateStep1 = (): boolean => {
    try {
      registerStep1Schema.parse({
        storeName: formData.shop.name,
        storePhone: formData.shop.cellphone
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<RegisterFormData> = {};
        error.errors.forEach((err) => {
          const field = err.path[0];
          if (field === "storeName") {
            fieldErrors.shop = { ...fieldErrors.shop, name: err.message } as any;
          } else if (field === "storePhone") {
            fieldErrors.shop = { ...fieldErrors.shop, cellphone: err.message } as any;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const validateStep3 = (): boolean => {
    try {
      registerStep3Schema.parse({
        document: formData.shop_billing_config.document,
        billingEmail: formData.shop_billing_config.billing_email
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<RegisterFormData["shop_billing_config"]> = {};
        error.errors.forEach((err) => {
          const field = err.path[0];
          if (field === "document") fieldErrors.document = err.message;
          if (field === "billingEmail") fieldErrors.billing_email = err.message;
        });
        setErrors(prev => ({ ...prev, shop_billing_config: fieldErrors }));
      }
      return false;
    }
  };

  const handleNextStep = () => {
    setErrors({});
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split(".");

    const processedValue =
      field === "cellphone" ? formatPhone(value) :
      field === "document" ? formatDocument(value) :
      value;

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof RegisterFormData],
        [field]: processedValue
      }
    }));

    if (errors[section as keyof RegisterFormData]) {
      setErrors(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof RegisterFormData],
          [field]: undefined
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const validatedData = registerSchema.parse(formData);
      await register(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Partial<RegisterFormData> = {};
        error.errors.forEach((err) => {
          const [section, field] = err.path;
          if (section && field) {
            // @ts-ignore
            formattedErrors[section as keyof RegisterFormData] = {
              ...formattedErrors[section as keyof RegisterFormData],
              [field]: err.message
            };
          }
        });
        setErrors(formattedErrors);
      } else {
        const apiErrorMessage = getApiErrorMessage(error);
        if (apiErrorMessage) {
          const messages = extractBackendMessages(apiErrorMessage);
          const fieldErrors = mapMessagesToFieldErrors(messages);
          applyBackendErrors(fieldErrors);

          const primaryMessage = messages[0] ?? apiErrorMessage;
          const friendlyMessage =
            BACKEND_ERROR_MAP[primaryMessage]?.message ?? stripValidationPrefix(primaryMessage);

          toast.error(friendlyMessage || "Erro ao cadastrar loja");
        } else {
          toast.error("Erro ao cadastrar loja");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          <AuthFormInput
            type="text"
            name="shop.name"
            placeholder="Nome do estabelecimento"
            value={formData.shop.name}
            onChange={handleChange}
            disabled={isLoading}
            label="Nome do estabelecimento"
            error={errors.shop?.name}
          />
          <AuthFormInput
            type="tel"
            name="shop.cellphone"
            placeholder="(00) 00000-0000"
            value={formData.shop.cellphone}
            onChange={handleChange}
            disabled={isLoading}
            label="Telefone"
            error={errors.shop?.cellphone}
          />
          <button
            type="button"
            className="w-full bg-[#1B1B1B] hover:bg-black text-white text-base font-medium py-4 rounded-2xl transition-colors cursor-pointer disabled:opacity-50 mt-2"
            onClick={handleNextStep}
            disabled={isLoading}
          >
            Próximo
          </button>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-4">
          <AuthFormInput
            type="text"
            name="shop_user.name"
            placeholder="Seu nome"
            value={formData.shop_user.name}
            onChange={handleChange}
            disabled={isLoading}
            label="Nome"
            error={errors.shop_user?.name}
          />
          <AuthFormInput
            type="email"
            name="shop_user.email"
            placeholder="seu@email.com"
            value={formData.shop_user.email}
            onChange={handleChange}
            disabled={isLoading}
            label="Email"
            error={errors.shop_user?.email}
          />
          <AuthFormInput
            type="password"
            name="shop_user.password"
            placeholder="Sua senha"
            value={formData.shop_user.password}
            onChange={handleChange}
            disabled={isLoading}
            label="Senha"
            error={errors.shop_user?.password}
            showPasswordToggle
          />
          <AuthFormInput
            type="password"
            name="shop_user.confirmPassword"
            placeholder="Confirme sua senha"
            value={formData.shop_user.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            label="Confirmar senha"
            error={errors.shop_user?.confirmPassword}
            showPasswordToggle
          />
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              className="flex-1 border border-[#E8E4DF] text-[#1B1B1B] text-base font-medium py-4 rounded-2xl transition-colors cursor-pointer hover:bg-[#f5f5f5]"
              onClick={() => setStep(1)}
              disabled={isLoading}
            >
              Voltar
            </button>
            <button
              type="button"
              className="flex-1 bg-[#1B1B1B] hover:bg-black text-white text-base font-medium py-4 rounded-2xl transition-colors cursor-pointer disabled:opacity-50"
              onClick={handleNextStep}
              disabled={isLoading}
            >
              Próximo
            </button>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthFormInput
          type="text"
          name="shop_billing_config.document"
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
          value={formData.shop_billing_config.document}
          onChange={handleChange}
          disabled={isLoading}
          label="CPF ou CNPJ"
          error={errors.shop_billing_config?.document}
        />
        <AuthFormInput
          type="email"
          name="shop_billing_config.billing_email"
          placeholder="cobranca@seunegocio.com"
          value={formData.shop_billing_config.billing_email}
          onChange={handleChange}
          disabled={isLoading}
          label="Email de cobrança"
          error={errors.shop_billing_config?.billing_email}
        />
        <label className="flex items-start gap-3 cursor-pointer select-none mt-1">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded accent-[#009246] cursor-pointer flex-shrink-0"
          />
          <span className="text-sm text-[#858585] leading-snug">
            Li e aceito os{" "}
            <Link href="/termos" target="_blank" className="text-[#009246] font-medium hover:underline">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" target="_blank" className="text-[#009246] font-medium hover:underline">
              Política de Privacidade
            </Link>
          </span>
        </label>
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            className="flex-1 border border-[#E8E4DF] text-[#1B1B1B] text-base font-medium py-4 rounded-2xl transition-colors cursor-pointer hover:bg-[#f5f5f5]"
            onClick={() => setStep(2)}
            disabled={isLoading}
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={isLoading || !termsAccepted}
            className="flex-1 bg-[#1B1B1B] hover:bg-black text-white text-base font-medium py-4 rounded-2xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Cadastrar"}
          </button>
        </div>
      </form>
    );
  };

  return (
    <AuthLayout title="Cadastre-se na plataforma">
      <div className="flex justify-center mb-8">
        <div className="flex gap-2">
          <div className={`w-2.5 h-2.5 rounded-full transition-colors ${step === 1 ? 'bg-[#009246]' : 'bg-[#E8E4DF]'}`} />
          <div className={`w-2.5 h-2.5 rounded-full transition-colors ${step === 2 ? 'bg-[#009246]' : 'bg-[#E8E4DF]'}`} />
          <div className={`w-2.5 h-2.5 rounded-full transition-colors ${step === 3 ? 'bg-[#009246]' : 'bg-[#E8E4DF]'}`} />
        </div>
      </div>
      {renderStep()}
      <p className="text-sm text-[#858585] text-center mt-6">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-[#009246] font-medium hover:underline">
          Faça login
        </Link>
      </p>
    </AuthLayout>
  );
}
