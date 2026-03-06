"use client"

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';
import { ShopResponse } from "@/types/client-catalog";
import { useQuery } from '@tanstack/react-query';
import SearchBar from './components/search-bar';
import CategoryNavigation from './components/category-navigation';
import ProductGrid from './components/product-grid';
import ProductModal from './product-detail';
import { normalizeItems } from './normalize-items';
import { fetchShopBySlug } from './slug-service';
import type { CatalogItem } from './types';
import { useClient } from './client-context';
import ahoy from '@/lib/ahoy';

interface ClientStoreContentProps {
  shop: ShopResponse;
}

export default function ClientStoreContent({ shop: initialShop }: ClientStoreContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const slug = params.slug as string;
  const { setShop } = useClient();

  // React Query com dado SSR como initialData — refetch automático em background
  const { data: shop } = useQuery({
    queryKey: ['shop', slug],
    queryFn: () => fetchShopBySlug(slug),
    initialData: initialShop,
    initialDataUpdatedAt: 0,       // marca dado SSR como "velho" → refetch imediato
    staleTime: 0,                  // sempre stale → refetch em qualquer trigger
    refetchInterval: 1000 * 60,    // refetch a cada 60s em background
    refetchOnWindowFocus: true,    // refetch ao voltar pra aba
  });

  const [activeCategory, setActiveCategory] = useState('all');

  // Valor bruto do input (atualiza imediatamente, sem delay)
  const [searchInput, setSearchInput] = useState('');
  // Valor com debounce usado no filtro dos produtos
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const id = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Sincronizar localStorage e contextos quando shop mudar
  useEffect(() => {
    localStorage.removeItem("shop");
    localStorage.setItem("shop", JSON.stringify(shop));
    setShop(shop);
    window.dispatchEvent(new Event('shop-updated'));
  }, [shop]);

  useEffect(() => {
    ahoy.track("catalog_view", { shop_id: shop.data.id });
  }, [shop.data.id]);

  const rawGroups: any = shop?.data.attributes.catalog_groups;

  const normalizedGroups: any[] = Array.isArray(rawGroups)
    ? rawGroups
    : (Array.isArray(rawGroups?.data)
      ? rawGroups.data
      : (Array.isArray(rawGroups?.data?.data) ? rawGroups.data.data : []));

  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const todayDayKey = `${dayKeys[new Date().getDay()]}_active`;

  const groups = normalizedGroups
    .filter((g: any) => g.attributes?.active !== false)
    .map((g: any) => {
      const items = normalizeItems(g.attributes?.items);
      const activeItems = items.filter((item: CatalogItem) => {
        const attrs = item.attributes as any;
        if (attrs?.active === false) return false;
        if (attrs?.[todayDayKey] === false) return false;
        return true;
      });
      if (activeItems.length === 0) return null;
      return { ...g, attributes: { ...g.attributes, items: { data: activeItems.map((item: CatalogItem) => ({ data: item })) } } };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      const pa = Number(a.attributes?.priority ?? 0);
      const pb = Number(b.attributes?.priority ?? 0);
      return pa - pb;
    });

  // Deep link: ?item=<id> abre o modal do produto
  const itemIdParam = searchParams.get('item');

  const linkedItem: CatalogItem | null = useMemo(() => {
    if (!itemIdParam) return null;
    for (const group of groups) {
      const items = normalizeItems(group.attributes?.items);
      const found = items.find((item: CatalogItem) => item.id === itemIdParam);
      if (found) return found;
    }
    return null;
  }, [itemIdParam, groups]);

  const handleLinkedItemClose = useCallback((open: boolean) => {
    if (!open) {
      router.replace(pathname, { scroll: false });
    }
  }, [router, pathname]);

  const handleClearSearch = () => {
    setSearchInput('');
    // searchQuery será limpo pelo useEffect após 350ms,
    // mas zeramos imediatamente pra UX instantânea
    setSearchQuery('');
  };

  return (
    <main className="min-h-screen pb-20 bg-gray-50/40">
      {/* Sticky search + nav bar */}
      <div className="sticky top-16 z-40 w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
          {/*
            Mobile/tablet: busca em cima, abas embaixo
            Desktop (lg+): abas à esquerda, busca à direita — mesma linha
          */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6 py-2.5 lg:py-2">
            {/* Categorias — flex-1 no desktop (order-1), segunda linha no mobile (order-2) */}
            <div className="order-2 lg:order-1 lg:flex-1 min-w-0 mt-2 lg:mt-0 overflow-hidden">
              <CategoryNavigation
                categories={groups}
                activeCategory={activeCategory}
                onChange={setActiveCategory}
              />
            </div>

            {/* Busca — full width no mobile (order-1), largura fixa no desktop (order-2) */}
            <div className="order-1 lg:order-2 w-full lg:w-64 xl:w-72 flex-shrink-0">
              <SearchBar value={searchInput} onChange={setSearchInput} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px]">
        <ProductGrid
          categories={groups}
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          onClearSearch={handleClearSearch}
        />
      </div>

      {linkedItem && (
        <ProductModal
          product={linkedItem}
          externalOpen={true}
          onExternalOpenChange={handleLinkedItemClose}
        />
      )}
    </main>
  );
}
