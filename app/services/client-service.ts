import api from '@/app/lib/api'
import { LoginInput, RegisterInput } from '../schemas/client-auth/auth.schema'

export interface AuthResponse {
  customer: {
    id: string
    name: string
    email: string
    cellphone: string
  }
  token: string
}

export const authService = {
  async login(credentials: LoginInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/customers/login', credentials)
    return data
  },

  async register(userData: RegisterInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/customers/register', userData)
    return data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  }
} 