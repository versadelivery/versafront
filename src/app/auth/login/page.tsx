"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useClientLogin } from "../use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "../auth-schema";
import { Loader2, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { z } from "zod";
import Image from "next/image";
import favicon from "@/public/logo/favicon.svg";
import logoInlineBlack from "@/public/logo/logo-inline-black.svg";
import { useRouter, useSearchParams } from "next/navigation";
import { useClient } from "@/app/(public)/[slug]/client-context";
import Link from "next/link";
import PublicLoading from "@/components/public-loading";

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useClientLogin();
  const { client } = useClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';

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

  const logoHref = redirectTo ? decodeURIComponent(redirectTo) : '/';

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mr-auto cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:block">Voltar</span>
            </button>
            <Link href={logoHref} className="md:hidden">
              <Image src={favicon} alt="Versa" width={90} height={90} priority />
            </Link>
            <Link href={logoHref} className="hidden md:block">
              <Image src={logoInlineBlack} alt="Versa" width={180} height={56} priority />
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
          <p className="text-base text-muted-foreground mt-1">
            Entre com suas credenciais para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1.5 block">Email</Label>
            <Input
              id="email"
              type="email"
              {...registerForm("email")}
              placeholder="johndoe@mail.com"
              className="h-14 rounded-md border-[#E5E2DD] focus:border-primary/40 text-base placeholder:text-gray-400"
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1.5 block">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...registerForm("password")}
                placeholder="********"
                className="h-14 rounded-md border-[#E5E2DD] focus:border-primary/40 text-base pr-11 placeholder:text-gray-400"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-md text-base font-semibold bg-primary hover:bg-primary/90 text-white transition-colors cursor-pointer"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Entrar
          </Button>

          <p className="text-center text-base text-muted-foreground">
            Não tem uma conta?{' '}
            <Link
              href={`/auth/register${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
              className="font-semibold text-primary hover:text-primary/90 transition-colors"
            >
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PublicLoading />}>
      <LoginForm />
    </Suspense>
  );
}
