import api from "@/api/config"
import { API_ENDPOINTS } from "@/api/routes"
import { LoginData } from "@/types/utils"
import { RegisterFormData } from "@/schemas/client-auth/client-auth-schema"

interface UserData {
  email: string
  name: string
  role: string
  shop: {
    type: string
    attributes: {
      cellphone: string
      name: string
      slug: string
    }
  }
}

type LoginResponse = {
  token: string
  user: UserData
}

export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  const response = await api.post(API_ENDPOINTS.LOGIN, data)
  return {
    token: response.data.token,
    user: response.data.user
  }
}

export const registerShop = async (data: any) => {
  const response = await api.post(API_ENDPOINTS.SHOPS, data)
  return response.data
}