"use client";

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, registerSchema, LoginInput, RegisterInput } from '@/schemas/client-auth/auth.schema'
import { useAuth } from '@/hooks/useClientAuth'
import { FormField } from './form-field'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Mail, Lock, User, Phone, Loader2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

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

  const phoneMask = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1 $2').replace(/(\d{5})(\d)/, '$1-$2')
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {isLogin ? "Bem-vindo de volta" : "Criar conta"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLogin ? "Entre com suas credenciais" : "Preencha seus dados para começar"}
        </p>
      </div>

      {isLogin ? (
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
          <FormField
            label="Email"
            className='shadow-sm rounded-sm bg-transparent w-full p-8 border pr-10 placeholder:text-foreground/40'
            type="email"
            placeholder='johndoe@mail.com'
            icon={<Mail className="h-4 w-4" />}
            error={loginForm.formState.errors.customer?.email?.message}
            {...loginForm.register('customer.email')}
          />

          <FormField
            label="Senha"
            type="password"
            placeholder='********'
            icon={<Lock className="h-4 w-4" />}
            className='shadow-sm rounded-sm bg-transparent w-full p-8 border pr-10 placeholder:text-foreground/40'
            error={loginForm.formState.errors.customer?.password?.message}
            {...loginForm.register('customer.password')}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
          <FormField
            label="Nome"
            placeholder='John Doe'
            icon={<User className="h-4 w-4" />}
            className='shadow-sm rounded-sm bg-transparent w-full p-8 border pr-10 placeholder:text-foreground/40'
            error={registerForm.formState.errors.customer?.name?.message}
            {...registerForm.register('customer.name')}
          />

          <FormField
            label="Email"
            placeholder='johndoe@mail.com'
            type="email"
            icon={<Mail className="h-4 w-4" />}
            className='shadow-sm rounded-sm bg-transparent w-full p-8 border pr-10 placeholder:text-foreground/40'
            error={registerForm.formState.errors.customer?.email?.message}
            {...registerForm.register('customer.email')}
          />

          <FormField
            label="Senha"
            placeholder='********'
            type="password"
            icon={<Lock className="h-4 w-4" />}
            className='shadow-sm rounded-sm bg-transparent w-full p-8 border pr-10 placeholder:text-foreground/40'
            error={registerForm.formState.errors.customer?.password?.message}
            {...registerForm.register('customer.password')}
          />

          <FormField
            label="Celular"
            placeholder='(11) 99999-9999'
            icon={<Phone className="h-4 w-4" />}
            className='shadow-sm rounded-sm bg-transparent w-full p-8 border pr-10 placeholder:text-foreground/40'
            error={registerForm.formState.errors.customer?.cellphone?.message}
            {...registerForm.register('customer.cellphone', {
              onChange: (e) => {
                const value = e.target.value
                const maskedValue = phoneMask(value)
                registerForm.setValue('customer.cellphone', maskedValue)
              }
            })}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              'Criar conta'
            )}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        <Separator />
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="cursor-pointer w-full text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {isLogin ? 'Não tem uma conta? Registre-se' : 'Já tem uma conta? Entre'}
        </button>
      </div>
    </div>
  )
}