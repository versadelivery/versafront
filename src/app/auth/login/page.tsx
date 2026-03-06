"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useClientLogin } from "../use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "../auth-schema";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { z } from "zod";
import Image from "next/image";
import logoInline from "@/public/logo/logo-inline-black.svg";
import { useRouter, useSearchParams } from "next/navigation";
import { useClient } from "@/app/(public)/[slug]/client-context";
import Link from "next/link";

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useClientLogin();
  const { client } = useClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';

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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    login({ email: data.email, password: data.password });
  };

  const handleGoBack = () => {
    if (redirectTo) {
      router.push(decodeURIComponent(redirectTo));
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF9F7]">
      <Button variant="link" type="button" onClick={handleGoBack} className="absolute top-8 left-8 text-primary hover:bg-primary hover:text-white transition-colors rounded-md">
        <ArrowLeft className="h-5 w-5" />
        Voltar
      </Button>
      <div className="mb-2 text-center flex flex-col items-center">
        <Image src={logoInline} width={260} alt="Versa Delivery" className="-mb-16" />
      </div>
      <div className="w-full max-w-lg space-y-6 bg-white px-8 rounded-md flex flex-col items-center">
        <div className="text-center w-full">
          <h2 className="text-3xl font-bold tracking-tight text-gray-700">
            Bem-vindo de volta :)
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Entre com suas credenciais para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-bold text-foreground/40 mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                {...registerForm("email")}
                placeholder="johndoe@mail.com"
                className="rounded-md bg-transparent w-full p-8 border border-[#E5E2DD] pr-10 placeholder:text-foreground/40"
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
                  className="rounded-md bg-transparent w-full p-8 border border-[#E5E2DD] pr-10 placeholder:text-foreground/40"
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
          </div>

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center p-8 border pr-10 text-lg font-medium rounded-md bg-primary hover:bg-primary/90 text-white transition-colors"
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              Entrar
            </Button>
          </div>

          <div className="text-center w-full">
            <Link 
              href={`/auth/register${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
              className="text-md font-medium text-primary hover:text-primary/90 transition-colors"
            >
              Não tem uma conta? Cadastre-se
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
