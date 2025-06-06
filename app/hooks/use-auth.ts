import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser, registerShop } from '../services/auth-service'
import { LoginData, LoginResponse, UserData } from '../types/utils'
import { getToken, setToken, removeToken } from '../lib/auth'

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

  const register = async (data: any)=> {
    const response = await registerShop(data)
    setToken(response.token)
    setUser(response.user)
    router.push('/admin')
    return response
  }

  const login = async (data: LoginData): Promise<LoginResponse> => {
    try {
      const response = await loginUser(data)
      setToken(response.token)
      setUser(response.user)
      router.push('/admin')
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    removeToken()
    setUser(null)
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