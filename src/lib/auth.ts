// Admin tokens (merchant)
const ADMIN_TOKEN_KEY = 'auth_token'

// Client tokens
const CLIENT_TOKEN_KEY = 'client_token'

// Super Admin tokens
const SUPER_ADMIN_TOKEN_KEY = 'super_admin_token'

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try { return localStorage.getItem(key) } catch { return null }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(key, value) } catch { /* noop */ }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return
    try { localStorage.removeItem(key) } catch { /* noop */ }
  },
}

// Admin token functions
export const getToken = (): string | null => safeLocalStorage.getItem(ADMIN_TOKEN_KEY)
export const setToken = (token: string): void => safeLocalStorage.setItem(ADMIN_TOKEN_KEY, token)
export const removeToken = (): void => safeLocalStorage.removeItem(ADMIN_TOKEN_KEY)

// Client token functions
export const getClientToken = (): string | null => safeLocalStorage.getItem(CLIENT_TOKEN_KEY)
export const setClientToken = (token: string): void => safeLocalStorage.setItem(CLIENT_TOKEN_KEY, token)
export const removeClientToken = (): void => safeLocalStorage.removeItem(CLIENT_TOKEN_KEY)

// Legacy compatibility functions
export const getAdminToken = (): string | null => {
  return getToken()
}

export const removeUser = (): void => {
  removeClientToken()
}

// Super Admin token functions
export const getSuperAdminToken = (): string | null => safeLocalStorage.getItem(SUPER_ADMIN_TOKEN_KEY)
export const setSuperAdminToken = (token: string): void => safeLocalStorage.setItem(SUPER_ADMIN_TOKEN_KEY, token)
export const removeSuperAdminToken = (): void => safeLocalStorage.removeItem(SUPER_ADMIN_TOKEN_KEY)