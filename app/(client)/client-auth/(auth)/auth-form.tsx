"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AuthToggle } from "./auth-toggle";
import { FormField } from "./form-field";
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from "./validations/client-auth-schema";
import { Lock, Mail, User, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: isLogin 
      ? { email: "", password: "" }
      : { email: "", password: "", name: "", cellphone: "" }
  });

  async function onSubmit(data: LoginFormData | RegisterFormData) {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Form submitted:", data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md w-full mx-auto p-8 space-y-8 bg-card rounded-xl border-none">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold bg-primary from-primary to-purple-600 bg-clip-text text-transparent">
          VERSA DELIVERY
        </h1>
        <p className="text-muted-foreground">
          {isLogin ? "Faça login para continuar" : "Preencha seus dados para se registrar"}
        </p>
      </motion.div>

      <AuthToggle isLogin={isLogin} setIsLogin={setIsLogin} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {!isLogin && (
              <>
                <FormField
                  label="Nome completo"
                  name="name"
                  placeholder="Digite seu nome"
                  icon={<User className="h-4 w-4" />}
                  error={(form.formState.errors as any).name}
                  register={form.register}
                />
                <FormField
                  label="Telefone"
                  name="cellphone"
                  placeholder="(00) 00000-0000"
                  icon={<Phone className="h-4 w-4" />}
                  error={(form.formState.errors as any).cellphone}
                  register={form.register}
                />
              </>
            )}

            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail className="h-4 w-4" />}
              error={form.formState.errors.email}
              register={form.register}
            />

            <FormField
              label="Senha"
              name="password"
              type="password"
              placeholder="••••••"
              icon={<Lock className="h-4 w-4" />}
              error={form.formState.errors.password}
              register={form.register}
            />
          </motion.div>

          {isLogin && (
            <div className="flex justify-end">
              <Button variant="link" size="sm" className="px-0 text-muted-foreground">
                Esqueceu a senha?
              </Button>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Processando..." : isLogin ? "Entrar" : "Registrar"}
            </Button>

          </motion.div>
        </form>
      </Form>
    </div>
  );
}