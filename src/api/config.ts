import axios from "axios"
import { API_BASE_URL } from "@/api/routes"
import { getToken, removeToken } from "@/lib/auth"  

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       removeToken()
//       if (typeof window !== 'undefined') {
//         window.location.href = '/login'
//       }
//     }
//     return Promise.reject(error)
//   }
// )

export default api