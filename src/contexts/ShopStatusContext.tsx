"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ShopStatusContextType {
  isOpen: boolean;
  loading: boolean;
  checkStatus: () => Promise<void>;
}

const ShopStatusContext = createContext<ShopStatusContextType>({
  isOpen: true,
  loading: true,
  checkStatus: async () => {}
});

export const useShopStatusContext = () => {
  const context = useContext(ShopStatusContext);
  if (!context) {
    throw new Error('useShopStatusContext must be used within a ShopStatusProvider');
  }
  return context;
};

interface ShopStatusProviderProps {
  children: React.ReactNode;
}

export const ShopStatusProvider: React.FC<ShopStatusProviderProps> = ({ 
  children
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
      // Buscar dados do shop do localStorage (salvos pelo ClientStoreContent)
      const shopData = localStorage.getItem("shop");
      if (shopData) {
        const shop = JSON.parse(shopData);
        if (shop?.data?.attributes?.shop_status) {
          setIsOpen(shop.data.attributes.shop_status.is_open);
          setLoading(false);
          return;
        }
      }

      // Se não temos dados, assumir que está aberta para não bloquear vendas
      // (não fazer chamadas autenticadas em páginas públicas)
      setIsOpen(true);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao verificar status da loja:', error);
      setIsOpen(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Verificar status a cada minuto
    const interval = setInterval(checkStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Escutar mudanças no localStorage (cross-tab) e custom event (same-tab)
  useEffect(() => {
    const handleStorageChange = () => {
      checkStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('shop-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('shop-updated', handleStorageChange);
    };
  }, []);

  return (
    <ShopStatusContext.Provider value={{ isOpen, loading, checkStatus }}>
      {children}
    </ShopStatusContext.Provider>
  );
};
