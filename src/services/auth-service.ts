import api from "@/api/config"
import { API_ENDPOINTS, API_BASE_URL } from "@/api/routes"
import { LoginData, RegisterData } from "@/types/utils"

const mapUserResponse = (payload: any) => {
  const userData = payload.data

  return {
    token: payload.token,
    user: {
      ...userData.attributes,
      id: userData.id,
      shop: userData.attributes.shop?.data,
    },
  }
}

export const loginUser = async (data: LoginData) => {
  const response = await api.post(API_ENDPOINTS.LOGIN, data)
  return mapUserResponse(response.data)
}

export const impersonateShop = async (shopId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/super_admins/shops/${shopId}/impersonate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.error || "Erro ao impersonar merchant")
  }

  return mapUserResponse(await response.json())
}

export const registerShop = async (data: any) => {
  const { confirmPassword, ...shopUserData } = data.shop_user || {}
  const payload: RegisterData & { referral_code?: string } = {
    shop: data.shop,
    shop_user: shopUserData,
    shop_billing_config: data.shop_billing_config,
    ...(data.referral_code ? { referral_code: data.referral_code } : {}),
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
