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
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null

    if (!token) {
      setIsLoading(false)
      return
    }

    if (storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Error parsing stored user', e)
        localStorage.removeItem('auth_user')
      }
    }

    setIsLoading(false)
  }, [])

  const register = async (data: RegisterData) => {
    const response = await registerShop(data)
    toast.success('Loja cadastrada com sucesso!')
    router.push('/pending-approval')
    return response
  }

  const login = async (data: LoginData): Promise<LoginResponse> => {
    try {
      const response = await loginUser(data)

      const shopApproved = response.user?.shop?.attributes?.approved

      if (shopApproved === false) {
        router.push('/pending-approval')
        return response
      }

      setToken(response.token)
      setUser(response.user)
      localStorage.setItem('auth_user', JSON.stringify(response.user))
      toast.success('Login realizado com sucesso')

      if (response.user?.role === 'delivery_man') {
        router.push('/delivery')
      } else {
        router.push('/admin')
      }

      return response
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } }
      const errorMessage = axiosError.response?.data?.error || 'Erro ao fazer login'
      toast.error(errorMessage)
      throw error
    }
  }

  const logout = () => {
    removeToken()
    removeUser()
    localStorage.removeItem('auth_user')
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