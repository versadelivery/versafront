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

  const groups = shop?.data.attributes.catalog_groups.data || [];
  
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
