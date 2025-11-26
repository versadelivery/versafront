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

export const registerShop = async (data: any) => {
  // Remove confirmPassword antes de enviar para a API (campo usado apenas para validação no frontend)
  const { confirmPassword, ...shopUserData } = data.shop_user || {}
  const payload: RegisterData = {
    shop: data.shop,
    shop_user: shopUserData
  }
  const response = await api.post(API_ENDPOINTS.SHOPS, payload)
  return response.data
}