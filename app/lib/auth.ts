export const TOKEN_KEY = '@versa:token';

export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY) !== null;
  }
  return false;
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const login = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};