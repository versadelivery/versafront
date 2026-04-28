import axios from "axios"
import { API_BASE_URL } from "@/api/routes"
import { getClientToken, getToken, removeToken, removeClientToken } from "@/lib/auth"

type TokenType = 'normal' | 'client' | 'admin'

let currentTokenType: TokenType = 'normal'

export const setTokenType = (type: TokenType) => {
  currentTokenType = type
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
})

api.interceptors.request.use((config) => {
  if (currentTokenType === 'normal') {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } else if (currentTokenType === 'client') {
    const clientToken = getClientToken()
    if (clientToken) {
      config.headers.Authorization = `Bearer ${clientToken}`
    }
  } else if (currentTokenType === 'admin') {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (currentTokenType === 'client') {
        removeClientToken()
        localStorage.removeItem('client')
      } else {
        removeToken()
        localStorage.removeItem('auth_user')
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login'
        }
      }
    }

    if (error.response?.status === 403 && error.response?.data?.code === "SHOP_UNAUTHORIZED") {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/pending-approval')) {
        window.location.href = "/pending-approval";
      }
    }

    return Promise.reject(error);
  }
);

export default api