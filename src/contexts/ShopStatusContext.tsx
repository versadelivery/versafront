"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchShopBySlug } from '@/app/(public)/[slug]/slug-service';

interface ShopStatusContextType {
  isOpen: boolean;
  loading: boolean;
  checkStatus: () => void;
}

const ShopStatusContext = createContext<ShopStatusContextType>({
  isOpen: true,
  loading: true,
  checkStatus: () => {}
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
  const [slug, setSlug] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Lê slug do localStorage após montar (sem mismatch de hidratação)
  useEffect(() => {
    try {
      const cached = localStorage.getItem('shop');
      const s = cached ? JSON.parse(cached)?.data?.attributes?.slug : null;
      if (s) setSlug(s);
    } catch {}

    // Atualiza slug se a loja mudar (ex: usuário navega para outra loja)
    const handleShopUpdated = () => {
      try {
        const cached = localStorage.getItem('shop');
        const s = cached ? JSON.parse(cached)?.data?.attributes?.slug : null;
        if (s) setSlug(s);
      } catch {}
    };

    window.addEventListener('shop-updated', handleShopUpdated);
    return () => window.removeEventListener('shop-updated', handleShopUpdated);
  }, []);

  // Mesma queryKey do catálogo (['shop', slug]) → compartilha o cache do React Query.
  // Quando o catálogo refaz o fetch, este contexto recebe o dado atualizado sem nova requisição.
  // Quando o usuário está em /carrinho ou /conferir (catálogo desmontado), polling próprio de 60s garante atualização.
  const { data: shopData, isLoading, refetch } = useQuery({
    queryKey: ['shop', slug],
    queryFn: () => fetchShopBySlug(slug!),
    enabled: !!slug,
    staleTime: 0,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const isOpen = shopData?.data?.attributes?.shop_status?.is_open ?? true;
  const loading = !!slug && isLoading && !shopData;

  const checkStatus = () => {
    if (slug) queryClient.invalidateQueries({ queryKey: ['shop', slug] });
  };

  return (
    <ShopStatusContext.Provider value={{ isOpen, loading, checkStatus }}>
      {children}
    </ShopStatusContext.Provider>
  );
};
