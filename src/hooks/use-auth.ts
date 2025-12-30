import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser, registerShop } from '../services/auth-service'
import { LoginData, LoginResponse, RegisterData, UserData } from '../types/utils'
import { getToken, setToken, removeToken, removeUser } from '../lib/auth'
import { toast } from 'sonner'

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    setIsLoading(false)
  }, [])

  const register = async (data: RegisterData)=> {
    const response = await registerShop(data)
    toast.success('Loja cadastrada com sucesso!')
    router.push('/pending-approval')
    return response
  }

  const login = async (data: LoginData): Promise<LoginResponse> => {
    try {
      const response = await loginUser(data)

      const shopApproved = response.data?.attributes?.shop?.data?.attributes?.approved

      if (shopApproved === false) {
        router.push('/pending-approval')
        return response
      }

      setToken(response.token)
      setUser(response.user)
      toast.success('Login realizado com sucesso')
      router.push('/admin')

      return response
    } catch (error) {
      toast.error('Erro ao fazer login')
      throw error
    }
  }

  const logout = () => {
    removeToken()
    removeUser()
    toast.success('Logout realizado com sucesso')
    router.push('/login')
  }

  const isAuthenticated = () => {
    return !!getToken()
  }

  return {
    user,
    isLoading,
    isAuthenticated: isAuthenticated(),
    login,
    logout,
    register,
    token: getToken()
  }
}