import api from "@/api/config"
import { API_ENDPOINTS } from "@/api/routes"
import { LoginData, RegisterData } from "@/types/utils"

export const loginUser = async (data: LoginData) => {
  const response = await api.post(API_ENDPOINTS.LOGIN, data)
  return {
    token: response.data.token,
    user: response.data.user
  }
}

export const registerShop = async (data: RegisterData) => {
  const response = await api.post(API_ENDPOINTS.SHOPS, data)
  return response.data
}