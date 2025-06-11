"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ClientData } from "./types";
import { ShopResponse } from "@/types/client-catalog";

interface PaymentMethod {
  id: string;
  type: string;
  attributes: {
    name: string;
    description?: string;
    priority: number;
    image_url?: string;
  };
}

interface ClientContextData {
  client: ClientData | null;
  setClient: (client: ClientData | null) => void;
  isAuthenticated: boolean;
  shop: ShopResponse | null;
  setShop: (shop: ShopResponse | null) => void;
  paymentMethods: PaymentMethod[];
  setPaymentMethods: (methods: PaymentMethod[]) => void;
}

const ClientContext = createContext<ClientContextData>({} as ClientContextData);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ClientData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    const storedClient = localStorage.getItem("client");
    const token = localStorage.getItem("client_token");
    const storedShop = localStorage.getItem("shop");
    const storedPaymentMethods = localStorage.getItem("payment_methods");

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

    if (storedShop) {
      try {
        const parsedShop = JSON.parse(storedShop);
        setShop(parsedShop);
      } catch (error) {
        localStorage.removeItem("shop");
        setShop(null);
      }
    }

    if (storedPaymentMethods) {
      try {
        const parsedPaymentMethods = JSON.parse(storedPaymentMethods);
        setPaymentMethods(parsedPaymentMethods);
      } catch (error) {
        localStorage.removeItem("payment_methods");
        setPaymentMethods([]);
      }
    }
  }, []);

  const handleSetClient = (newClient: ClientData | null) => {
    setClient(newClient);
    setIsAuthenticated(!!newClient);
  };

  const handleSetShop = (newShop: ShopResponse | null) => {
    setShop(newShop);
    if (newShop) {
      localStorage.setItem("shop", JSON.stringify(newShop));
    } else {
      localStorage.removeItem("shop");
    }
  };

  const handleSetPaymentMethods = (methods: PaymentMethod[]) => {
    setPaymentMethods(methods);
    if (methods.length > 0) {
      localStorage.setItem("payment_methods", JSON.stringify(methods));
    } else {
      localStorage.removeItem("payment_methods");
    }
  };

  return (
    <ClientContext.Provider value={{ 
      client, 
      setClient: handleSetClient, 
      isAuthenticated,
      shop,
      setShop: handleSetShop,
      paymentMethods,
      setPaymentMethods: handleSetPaymentMethods
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