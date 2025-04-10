import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/auth.service'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export function useAuth() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/catalog'

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      toast.success('Login realizado com sucesso')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push(redirectTo)
    },
    onError: (error) => {
      toast.error('Erro ao fazer login')
    }
  })

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      toast.success('Cadastro realizado com sucesso')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push(redirectTo)
    },
    onError: (error) => {
      toast.error('Erro ao fazer cadastro')
    }
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      toast.success('Logout realizado com sucesso')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/client-auth/login')
    },
    onError: (error) => {
      toast.error('Erro ao fazer logout')
    }
  })

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoading: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error: loginMutation.error || registerMutation.error || logoutMutation.error
  }
} 