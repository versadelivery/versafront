import axios from "axios"
import { API_BASE_URL } from "@/api/routes"
import { getClientToken, getToken, removeToken } from "@/lib/auth"  

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

export default api