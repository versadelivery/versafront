"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthFormInput } from "@/components/auth/auth-form-input";
import cesta from "../../../public/img/breads.png";
import { useState } from "react";
import { registerSchema, RegisterFormData } from "@/schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { formatPhone } from "@/utils/format-phone";
import { useAuth } from "@/hooks/use-auth";
import { isAxiosError } from "axios";
import { toast } from "sonner";

type RegisterStateErrors = {
  shop?: Partial<RegisterFormData["shop"]>;
  shop_user?: Partial<RegisterFormData["shop_user"]>;
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
    }
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split(".");
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof RegisterFormData],
        [field]: value
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
        <>
          <div className="w-full flex flex-col justify-center mb-4">
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
          </div>
          <div className="w-full flex flex-col justify-center mb-4">
            <AuthFormInput
              type="tel"
              name="shop.cellphone"
              placeholder="Telefone"
              value={formatPhone(formData.shop.cellphone)}
              onChange={handleChange}
              disabled={isLoading}
              label="Telefone"
              error={errors.shop?.cellphone}
            />
          </div>
          <Button
            type="button"
            className="w-full mt-4 mb-4 text-lg font-bold py-8"
            onClick={() => setStep(2)}
            disabled={isLoading}
          >
            Próximo
          </Button>
        </>
      );
    }

    return (
      <>
        <div className="w-full flex flex-col justify-center mb-4">
          <AuthFormInput
            type="text"
            name="shop_user.name"
            placeholder="Nome"
            value={formData.shop_user.name}
            onChange={handleChange}
            disabled={isLoading}
            label="Nome"
            error={errors.shop_user?.name}
          />
        </div>
        <div className="w-full flex flex-col justify-center mb-4">
          <AuthFormInput
            type="email"
            name="shop_user.email"
            placeholder="Email"
            value={formData.shop_user.email}
            onChange={handleChange}
            disabled={isLoading}
            label="Email"
            error={errors.shop_user?.email}
          />
        </div>
        <div className="w-full flex flex-col justify-center mb-4">
          <AuthFormInput
            type="password"
            name="shop_user.password"
            placeholder="Senha"
            value={formData.shop_user.password}
            onChange={handleChange}
            disabled={isLoading}
            label="Senha"
            error={errors.shop_user?.password}
            showPasswordToggle
          />
        </div>
        <div className="w-full flex flex-col justify-center mb-4">
          <AuthFormInput
            type="password"
            name="shop_user.confirmPassword"
            placeholder="Confirmar senha"
            value={formData.shop_user.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            label="Confirmar senha"
            error={errors.shop_user?.confirmPassword}
            showPasswordToggle
          />
        </div>
        <div className="flex gap-4 flex-col">
          <Button
            type="button"
            variant="outline"
            className="w-full mt-4 mb-4 text-lg font-bold py-8"
            onClick={() => setStep(1)}
            disabled={isLoading}
          >
            Voltar
          </Button>
          <Button
            type="submit"
            className="w-full mt-4 mb-4 text-lg font-bold py-8"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cadastrar"}
          </Button>
        </div>
      </>
    );
  };

  return (
    <AuthLayout title="Cadastre-se na plataforma" imageSrc={cesta}>
      <div className="flex justify-center mb-6">
        <div className="flex gap-2">
          <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-primary' : 'bg-gray-300'}`} />
          <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-primary' : 'bg-gray-300'}`} />
        </div>
      </div>
      {renderStep()}
      <p className="text-md text-center mt-4">
        Já tem uma conta? <Link href="/login" className="text-primary">Faça login</Link>
      </p>
    </AuthLayout>
  );
}