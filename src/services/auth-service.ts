import api from "@/api/config"
import { API_ENDPOINTS } from "@/api/routes"
import { LoginData, RegisterData } from "@/types/utils"

export const loginUser = async (data: LoginData) => {
  const response = await api.post(API_ENDPOINTS.LOGIN, data)

  // O backend retorna um formato JSONAPI: { data: { id, attributes: { ... } }, token: "..." }
  const userData = response.data.data

  return {
    token: response.data.token,
    user: {
      ...userData.attributes,
      id: userData.id,
      // O serializer aninha o shop em attributes.shop.data
      shop: userData.attributes.shop?.data
    }
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

export const forgotPassword = async (email: string) => {
  const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email })
  return response.data
}

export const resetPassword = async (data: {
  token: string
  password: string
  password_confirmation: string
}) => {
  const response = await api.post(API_ENDPOINTS.RESET_PASSWORD, data)
  return response.data
}