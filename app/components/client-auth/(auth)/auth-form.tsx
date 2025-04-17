"use client";

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, registerSchema, LoginInput, RegisterInput } from '../../../schemas/client-auth/auth.schema'
import { useAuth } from '../../../hooks/useClientAuth'
import { FormField } from './form-field'
import { Button } from '@/app/components/ui/button'
import { useState, useEffect } from 'react'

interface AuthFormProps {
  onClose: () => void;
}

export function AuthForm({ onClose }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const { login, register, isAuthenticated, isPending } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      onClose()
    }
  }, [isAuthenticated, onClose])

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { customer: { email: '', password: '' } }
  })

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { customer: { name: '', email: '', password: '', cellphone: '' } }
  })

  const onLoginSubmit = (data: LoginInput) => {
    login(data)
  }

  const onRegisterSubmit = (data: RegisterInput) => {
    register(data)
  }

  return (
    <div className="max-w-md w-full mx-auto p-8 space-y-8 bg-card rounded-xl border-none">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-primary from-primary to-purple-600 bg-clip-text text-transparent">
          VERSA DELIVERY
        </h1>
        <p className="text-muted-foreground">
          {isLogin ? "Faça login para continuar" : "Preencha seus dados para se registrar"}
        </p>
      </div>

      {isLogin ? (
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
          <FormField
            label="Email"
            type="email"
            error={loginForm.formState.errors.customer?.email?.message}
            {...loginForm.register('customer.email')}
          />

          <FormField
            label="Senha"
            type="password"
            error={loginForm.formState.errors.customer?.password?.message}
            {...loginForm.register('customer.password')}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Carregando...' : 'Entrar'}
          </Button>
        </form>
      ) : (
        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
          <FormField
            label="Nome"
            error={registerForm.formState.errors.customer?.name?.message}
            {...registerForm.register('customer.name')}
          />

          <FormField
            label="Email"
            type="email"
            error={registerForm.formState.errors.customer?.email?.message}
            {...registerForm.register('customer.email')}
          />

          <FormField
            label="Senha"
            type="password"
            error={registerForm.formState.errors.customer?.password?.message}
            {...registerForm.register('customer.password')}
          />

          <FormField
            label="Celular"
            error={registerForm.formState.errors.customer?.cellphone?.message}
            {...registerForm.register('customer.cellphone')}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Carregando...' : 'Registrar'}
          </Button>
        </form>
      )}

      <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        className="text-sm text-blue-600 hover:underline"
      >
        {isLogin ? 'Não tem uma conta? Registre-se' : 'Já tem uma conta? Entre'}
      </button>
    </div>
  )
}