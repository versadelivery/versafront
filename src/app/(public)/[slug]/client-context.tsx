"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ClientData } from "./types";
import { ShopResponse } from "@/types/client-catalog";
import { DeliveryConfig } from "@/services/delivery-service";
import { useShopBySlug } from "./use-slug";
import { useParams } from "next/navigation";
import { getClientToken } from "@/lib/auth";

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

interface ShopPaymentConfig {
  cash: boolean;
  debit: boolean;
  credit: boolean;
  manual_pix: boolean;
}

interface DeliveryNeighborhood {
  id: number;
  name: string;
  amount: number;
  min_value_free_delivery: number | null;
}

interface ShopDeliveryConfig {
  delivery_fee_kind: string;
  amount: number;
  min_value_free_delivery: number | null;
  shop_delivery_neighborhoods: {
    data: {
      id: string;
      type: string;
      attributes: DeliveryNeighborhood;
    }[];
  };
}

interface ClientContextData {
  client: ClientData | null;
  setClient: (client: ClientData | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  shop: ShopResponse | null;
  setShop: (shop: ShopResponse | null) => void;
  paymentMethods: PaymentMethod[];
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  shopPaymentConfig: ShopPaymentConfig | null;
  setShopPaymentConfig: (config: ShopPaymentConfig | null) => void;
  shopDeliveryConfig: ShopDeliveryConfig  | null;
  setShopDeliveryConfig: (config: ShopDeliveryConfig | null) => void;
}

const ClientContext = createContext<ClientContextData>({} as ClientContextData);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ClientData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [shopPaymentConfig, setShopPaymentConfig] = useState<ShopPaymentConfig | null>(null);
  const [shopDeliveryConfig, setShopDeliveryConfig] = useState<ShopDeliveryConfig | null>(null);

  useEffect(() => {
    const storedClient = localStorage.getItem("client");
    const token = getClientToken();
    let storedShop = null;
    
    try {
      const shopData = localStorage.getItem("shop");
      if (shopData) {
        storedShop = JSON.parse(shopData);
      }
    } catch (error) {
      console.error("Erro ao recuperar dados da loja:", error);
      localStorage.removeItem("shop");
    }

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
    
    if (storedShop && storedShop.data) {
      try {
        setShop(storedShop);
        setShopDeliveryConfig(storedShop.data.attributes.shop_delivery_config.data.attributes)
        setShopPaymentConfig(storedShop.data.attributes.shop_payment_config.data.attributes)
      } catch (error) {
        localStorage.removeItem("shop");
        setShop(null);
        setShopDeliveryConfig(null);
        setShopPaymentConfig(null);
      }
    }
  }, []);

  const handleSetClient = (newClient: ClientData | null) => {
    setClient(newClient);
    setIsAuthenticated(!!newClient);
  };

  const handleLogout = () => {
    // Limpar dados do localStorage
    localStorage.removeItem("client");
    localStorage.removeItem("client_token");
    
    // Limpar estado
    setClient(null);
    setIsAuthenticated(false);
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

  const handleSetShopPaymentConfig = (config: ShopPaymentConfig | null) => {
    setShopPaymentConfig(config);
    if (config) {
      localStorage.setItem("shop_payment_config", JSON.stringify(config));
    } else {
      localStorage.removeItem("shop_payment_config");
    }
  };

  const handleSetShopDeliveryConfig = (config: ShopDeliveryConfig | null) => {
    setShopDeliveryConfig(config);
    if (config) {
      localStorage.setItem("shop_delivery_config", JSON.stringify(config));
    } else {
      localStorage.removeItem("shop_delivery_config");
    }
  };

  return (
    <ClientContext.Provider value={{ 
      client, 
      setClient: handleSetClient, 
      logout: handleLogout,
      isAuthenticated,
      shop,
      setShop: handleSetShop,
      paymentMethods,
      setPaymentMethods: handleSetPaymentMethods,
      shopPaymentConfig,
      setShopPaymentConfig: handleSetShopPaymentConfig,
      shopDeliveryConfig,
      setShopDeliveryConfig: handleSetShopDeliveryConfig
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