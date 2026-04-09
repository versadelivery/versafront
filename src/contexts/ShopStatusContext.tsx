"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchShopBySlug } from '@/app/(public)/[slug]/slug-service';

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
      // Buscar slug do localStorage para poder buscar dados frescos da API
      const shopData = localStorage.getItem("shop");
      const cachedShop = shopData ? JSON.parse(shopData) : null;
      const slug = cachedShop?.data?.attributes?.slug;

      if (slug) {
        // Buscar status atualizado diretamente da API (evita dado stale do localStorage)
        const freshShop = await fetchShopBySlug(slug);
        if (freshShop?.data?.attributes?.shop_status) {
          setIsOpen(freshShop.data.attributes.shop_status.is_open);
          // Atualizar localStorage com dado fresco
          localStorage.setItem("shop", JSON.stringify(freshShop));
          window.dispatchEvent(new Event('shop-updated'));
          setLoading(false);
          return;
        }
      }

      // Fallback: usar dado em cache do localStorage
      if (cachedShop?.data?.attributes?.shop_status) {
        setIsOpen(cachedShop.data.attributes.shop_status.is_open);
        setLoading(false);
        return;
      }

      // Sem dados: assumir aberta para não bloquear vendas
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
