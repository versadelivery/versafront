"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { shopStatusService } from '@/services/shopStatusService';

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

export const ShopStatusProvider: React.FC<ShopStatusProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await shopStatusService.getStatus();
      setIsOpen(response.data.attributes.is_open);
    } catch (error) {
      console.error('Erro ao verificar status da loja:', error);
      // Em caso de erro, assumir que está aberta para não bloquear vendas
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Verificar status a cada 2 minutos
    const interval = setInterval(checkStatus, 120000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <ShopStatusContext.Provider value={{ isOpen, loading, checkStatus }}>
      {children}
    </ShopStatusContext.Provider>
  );
};
