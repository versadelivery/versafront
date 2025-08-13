const TOKEN_KEY = 'auth_token'
const USER_KEY = 'client_token'

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}


export const getClientToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USER_KEY)
}

export const getAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USER_KEY)
}

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.clear()
}

export const removeUser = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_KEY)
}