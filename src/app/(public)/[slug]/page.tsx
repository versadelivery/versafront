"use client"

import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useShopBySlug } from './use-slug';
import StoreHeader from './components/store-header';
import ProductGrid from './components/product-grid';
import CategoryNavigation from './components/category-navigation';
import SearchBar from './components/search-bar';

export default function StoreCatalog() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: shop, isLoading } = useShopBySlug(slug);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground animate-pulse">Carregando catálogo da loja...</p>
        </div>
      </div>
    );
  }

  if (!shop) return notFound();

  const groups = shop?.data.attributes.catalog_groups.data || [];
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader shop={shop.data} />
      
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
    </div>
  );
}