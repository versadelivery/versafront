import { useState } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  
  const login = async (email: string, password: string): Promise<string> => {
    const mockToken = "seu_token_mockado_aqui";
    setToken(mockToken);
    localStorage.setItem('authToken', mockToken);
    return mockToken;
  };

  const logout = (): void => {
    setToken(null);
    localStorage.removeItem('authToken');
  };

  const getToken = (): string | null => {
    return token || localStorage.getItem('authToken');
  };

  return {
    token,
    getToken,
    login,
    logout,
    isAuthenticated: !!token || !!localStorage.getItem('authToken')
  };
}