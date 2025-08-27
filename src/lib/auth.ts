// Admin tokens
const ADMIN_TOKEN_KEY = 'auth_token'

// Client tokens  
const CLIENT_TOKEN_KEY = 'client_token'

// Admin token functions
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export const removeToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

// Client token functions
export const getClientToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CLIENT_TOKEN_KEY)
}

export const setClientToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(CLIENT_TOKEN_KEY, token)
}

export const removeClientToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CLIENT_TOKEN_KEY)
}

// Legacy compatibility functions
export const getAdminToken = (): string | null => {
  return getToken()
}

export const removeUser = (): void => {
  removeClientToken()
}