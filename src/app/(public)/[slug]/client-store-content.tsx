"use client"

import { useState, useEffect } from 'react';
import { ShopResponse } from "@/types/client-catalog";
import SearchBar from './components/search-bar';
import CategoryNavigation from './components/category-navigation';
import ProductGrid from './components/product-grid';

interface ClientStoreContentProps {
  shop: ShopResponse;
}

export default function ClientStoreContent({ shop }: ClientStoreContentProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Store shop data in localStorage for client-side usage
    localStorage.removeItem("shop");
    localStorage.setItem("shop", JSON.stringify(shop));
  }, [shop]);

  const rawGroups: any = shop?.data.attributes.catalog_groups;

  // Debug logs: structure and normalization of groups
  if (typeof window !== 'undefined') {
    try {
      // Log only once per page load
      if (!(window as any).__versa_logged_groups__) {
        (window as any).__versa_logged_groups__ = true;
        console.groupCollapsed('[Versa] Catalog groups payload debug');
        console.log('shop.id:', shop?.data?.id);
        console.log('catalog_groups raw:', rawGroups);
        console.log('Array.isArray(rawGroups):', Array.isArray(rawGroups));
        console.log('rawGroups?.data:', (rawGroups as any)?.data);
        console.log('Array.isArray(rawGroups?.data):', Array.isArray((rawGroups as any)?.data));
        console.log('rawGroups?.data?.data:', (rawGroups as any)?.data?.data);
        console.log('Array.isArray(rawGroups?.data?.data):', Array.isArray((rawGroups as any)?.data?.data));
        console.groupEnd();
      }
    } catch {}
  }
  const normalizedGroups: any[] = Array.isArray(rawGroups)
    ? rawGroups
    : (Array.isArray(rawGroups?.data)
      ? rawGroups.data
      : (Array.isArray(rawGroups?.data?.data) ? rawGroups.data.data : []));

  if (typeof window !== 'undefined') {
    try {
      console.groupCollapsed('[Versa] Catalog groups normalized');
      console.log('normalizedGroups length:', normalizedGroups.length);
      console.log('normalizedGroups ids:', normalizedGroups.map((g: any) => g.id));
      console.log('normalizedGroups names:', normalizedGroups.map((g: any) => g.attributes?.name));
      console.groupEnd();
    } catch {}
  }

  const groups = normalizedGroups
    .slice()
    .sort((a: any, b: any) => {
      const pa = Number(a.attributes?.priority ?? 0);
      const pb = Number(b.attributes?.priority ?? 0);
      // menor número = maior prioridade (1 antes de 2)
      return pa - pb;
    });

  if (typeof window !== 'undefined') {
    try {
      console.groupCollapsed('[Versa] Catalog groups after sort by priority');
      console.table(groups.map((g: any) => ({ id: g.id, name: g.attributes?.name, priority: g.attributes?.priority })));
      console.groupEnd();
    } catch {}
  }
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SearchBar onSearch={handleSearch} />
          <CategoryNavigation 
            categories={groups} 
            activeCategory={activeCategory} 
            onChange={handleCategoryChange} 
          />
        </div>
        
        <ProductGrid 
          categories={groups} 
          activeCategory={activeCategory}
          searchQuery={searchQuery}
        />
      </div>
    </main>
  );
}
