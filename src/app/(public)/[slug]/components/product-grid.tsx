"use client"

import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './product-card';
import { normalizeItems } from '../normalize-items';
import type { CatalogItem } from '../types';

interface ProductGridProps {
  categories: any[];
  activeCategory: string;
  searchQuery: string;
}

export default function ProductGrid({ categories, activeCategory, searchQuery }: ProductGridProps) {
  if (typeof window !== 'undefined') {
    try {
      console.groupCollapsed('[Versa] ProductGrid input');
      console.log('categories length:', categories?.length);
      console.log('activeCategory:', activeCategory);
      console.log('searchQuery:', searchQuery);
      console.log('categories names:', (categories || []).map((g: any) => g?.attributes?.name));
      console.groupEnd();
    } catch {}
  }

  const allItems = categories.flatMap(group => 
    normalizeItems(group.attributes.items)
  ).filter(item => 
    item.attributes.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.attributes.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const itemsByGroup = categories.reduce((acc, group) => {
    acc[group.attributes.name] = normalizeItems(group.attributes.items)
      .filter(item => 
        item.attributes.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.attributes.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return acc;
  }, {} as Record<string, CatalogItem[]>);

  const itemsToDisplay = activeCategory === 'all' 
    ? allItems 
    : itemsByGroup[activeCategory] || [];

  if (typeof window !== 'undefined') {
    try {
      console.groupCollapsed('[Versa] ProductGrid computed');
      console.log('allItems count:', allItems.length);
      console.log('itemsByGroup keys:', Object.keys(itemsByGroup));
      console.log('itemsToDisplay count:', itemsToDisplay.length);
      console.table((categories || []).map((g: any) => ({
        group: g?.attributes?.name,
        items: normalizeItems(g?.attributes?.items)?.length || 0
      })));
      console.groupEnd();
    } catch {}
  }

  if (itemsToDisplay.length === 0) {
    return (
      <motion.div 
        className="col-span-full py-16 px-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto max-w-md">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? `Não encontramos nenhum produto correspondente a "${searchQuery}"`
              : "Não há produtos nesta categoria ainda"}
          </p>
          {searchQuery && (
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-primary border border-primary hover:bg-primary/5 transition-colors"
            >
              Limpar busca
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      key={activeCategory + searchQuery}
    >
      <AnimatePresence>
        {itemsToDisplay.map((item: CatalogItem, index: number) => (
          <ProductCard key={item.id || index} item={item} index={index} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}