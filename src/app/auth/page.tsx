"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useClientLogin, useClientRegister } from "./use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, registerSchema } from "./auth-schema";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { z } from "zod";
import Image from "next/image";
import logoInline from "@/public/logo/logo-inline-black.svg";
import { useRouter, useSearchParams } from "next/navigation";
import PublicLoading from "@/components/public-loading";
import { formatPhone } from "@/utils/format-phone";
import { useClient } from "@/app/(public)/[slug]/client-context";
import { usePhoneMask } from "@/hooks/use-phone-mask";

type AuthMode = "login" | "register";
type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, isLoading: isLoadingLogin } = useClientLogin();
  const { register, isLoading: isLoadingRegister } = useClientRegister();
  const { client } = useClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';
  const { formatPhone, getUnmaskedValue } = usePhoneMask();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (client) {
      const targetPage = redirectTo ? decodeURIComponent(redirectTo) : '/';
      router.push(targetPage);
    }
  }, [client, redirectTo, router]);

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema),
    defaultValues: mode === "login" 
      ? { email: "", password: "" }
      : { name: "", email: "", password: "", confirmPassword: "", cellphone: "" },
  });

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    if (mode === "login") {
      login({ email: data.email, password: data.password });
    } else {
      const registerData = data as RegisterFormData;
      register({ 
        name: registerData.name, 
        email: registerData.email, 
        password: registerData.password,
        cellphone: getUnmaskedValue(registerData.cellphone)
      });
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    reset();
  };

  const handleGoBack = () => {
    if (redirectTo) {
      router.push(decodeURIComponent(redirectTo));
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Button variant="link" type="button" onClick={handleGoBack} className="absolute top-8 left-8 text-primary hover:bg-primary hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
      <div className="mb-2 text-center flex flex-col items-center">
        <Image src={logoInline} width={260} alt="Versa Delivery" className="-mb-16" />
      </div>
      <div className="w-full max-w-lg space-y-6 bg-white px-8 rounded-xs flex flex-col items-center">
        <div className="text-center w-full">
          <h2 className="text-3xl font-bold tracking-tight text-gray-700">
            {mode === "login" ? "Bem-vindo de volta" : "Criar nova conta"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === "login"
              ? "Entre com suas credenciais para continuar"
              : "Preencha as informações abaixo para continuar"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
          <div className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <Label htmlFor="name" className="text-sm font-bold text-foreground/40 mb-2 block">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    {...registerForm("name" as any)}
                    placeholder="John Doe"
                    className="rounded-xs bg-transparent w-full p-8 border border-black/10 pr-10 placeholder:text-foreground/40"
                  />
                  {(errors as any).name && (
                    <p className="mt-1 text-sm text-red-600">
                      {(errors as any).name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cellphone" className="text-sm font-bold text-foreground/40 mb-2 block">Celular</Label>
                  <Input
                    id="cellphone"
                    type="tel"
                    value={watch("cellphone") || ""}
                    placeholder="(00) 00000-0000"
                    className="rounded-xs bg-transparent w-full p-8 border border-black/10 pr-10 placeholder:text-foreground/40"
                    onChange={(e) => {
                      const formattedValue = formatPhone(e.target.value);
                      setValue("cellphone", formattedValue, { shouldValidate: true });
                    }}
                  />
                  {(errors as any).cellphone && (
                    <p className="mt-1 text-sm text-red-600">
                      {(errors as any).cellphone.message}
                    </p>
                  )}
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email" className="text-sm font-bold text-foreground/40 mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                {...registerForm("email")}
                placeholder="johndoe@mail.com"
                className="rounded-xs bg-transparent w-full p-8 border border-black/10 pr-10 placeholder:text-foreground/40"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-bold text-foreground/40 mb-2 block">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...registerForm("password")}
                  placeholder="••••••••"
                  className="rounded-xs bg-transparent w-full p-8 border border-black/10 pr-10 placeholder:text-foreground/40"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            {mode === "register" && (
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-bold text-foreground/40 mb-2 block">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...registerForm("confirmPassword" as any)}
                    placeholder="••••••••"
                    className="rounded-xs bg-transparent w-full p-8 border border-black/10 pr-10 placeholder:text-foreground/40"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {(errors as any).confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {(errors as any).confirmPassword.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center p-8 border pr-10 text-lg font-medium rounded-xs bg-primary hover:bg-primary/90 text-white transition-colors"
              disabled={isLoadingLogin || isLoadingRegister}
              onClick={handleSubmit(onSubmit)}
            >
              {(isLoadingLogin || isLoadingRegister) && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              {mode === "login" ? "Entrar" : "Criar Conta"}
            </Button>
          </div>

          <div className="text-center w-full">
            <Button
              variant="link"
              type="button"
              onClick={toggleMode}
              className="text-md font-medium text-primary hover:text-primary/90 transition-colors w-full flex justify-center"
            >
              {mode === "login"
                ? "Não tem uma conta? Cadastre-se"
                : "Já tem uma conta? Entre"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<PublicLoading />}>
      <AuthForm />
    </Suspense>
  );
}
