"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ClientData } from "./types";

interface ClientContextData {
  client: ClientData | null;
  setClient: (client: ClientData | null) => void;
  isAuthenticated: boolean;
}

const ClientContext = createContext<ClientContextData>({} as ClientContextData);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ClientData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedClient = localStorage.getItem("client");
    const token = localStorage.getItem("client_token");

    if (storedClient && token) {
      try {
        const parsedClient = JSON.parse(storedClient);
        if (token) {
          setClient(parsedClient);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("client");
          localStorage.removeItem("client_token");
          setClient(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem("client");
        localStorage.removeItem("client_token");
        setClient(null);
        setIsAuthenticated(false);
      }
    }
  }, []);

  const handleSetClient = (newClient: ClientData | null) => {
    setClient(newClient);
    setIsAuthenticated(!!newClient);
  };

  return (
    <ClientContext.Provider value={{ 
      client, 
      setClient: handleSetClient, 
      isAuthenticated 
    }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClient deve ser usado dentro de um ClientProvider");
  }
  return context;
} 