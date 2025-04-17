import { useMutation, useQuery } from '@tanstack/react-query'
import { authService } from '@/app/services/client-service'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [customer, setCustomer] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const customerData = localStorage.getItem('customer')
    
    if (token && customerData) {
      try {
        const parsedCustomer = JSON.parse(customerData)
        setCustomer(parsedCustomer)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Erro ao analisar dados do usuário:', error)
        setIsAuthenticated(false)
        setCustomer(null)
      }
    } else {
      setIsAuthenticated(false)
      setCustomer(null)
    }
    
    setIsLoading(false)
  }, [])

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      toast.success('Login realizado com sucesso')
      localStorage.setItem('token', data.token)
      localStorage.setItem('customer', JSON.stringify(data.customer))
      setCustomer(data.customer)
      setIsAuthenticated(true)
      console.log(localStorage.getItem('customer'))
      console.log(localStorage.getItem('token'))
      console.log(isAuthenticated)
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
      localStorage.setItem('customer', JSON.stringify(data.customer))
      setCustomer(data.customer)
      setIsAuthenticated(true)
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
      setCustomer(null)
      setIsAuthenticated(false)
    },
    onError: (error) => {
      toast.error('Erro ao fazer logout')
    }
  })

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('customer')
    setCustomer(null)
    setIsAuthenticated(false)
  }

  return {
    isAuthenticated,
    isLoading,
    customer,
    
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    logoutWithApi: logoutMutation.mutate,
    
    isPending: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error: loginMutation.error || registerMutation.error || logoutMutation.error
  }
} 