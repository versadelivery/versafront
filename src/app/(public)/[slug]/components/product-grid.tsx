"use client"

import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from './product-card';
import { normalizeItems } from '../normalize-items';
import type { CatalogItem } from '../types';

interface ProductGridProps {
  categories: any[];
  activeCategory: string;
  searchQuery: string;
  onClearSearch: () => void;
}

export default function ProductGrid({ categories, activeCategory, searchQuery, onClearSearch }: ProductGridProps) {
  const filteredCategories = categories.map(group => ({
    ...group,
    items: normalizeItems(group.attributes.items).filter(item =>
      item.attributes.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.attributes.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  if (filteredCategories.length === 0) {
    return (
      <div className="py-20 px-4 text-center">
        <div className="mx-auto max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum produto encontrado</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {searchQuery
              ? `Nenhum resultado para "${searchQuery}".`
              : 'Não há produtos disponíveis no momento.'}
          </p>
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="px-6 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Limpar busca
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {filteredCategories.map((group) => (
        <section
          key={group.id}
          id={group.attributes.name.toLowerCase().replace(/\s+/g, '-')}
          className="scroll-mt-48"
        >
          <div className="flex items-center justify-between mb-5 px-0.5">
            <h2 className="text-base font-bold text-foreground">
              {group.attributes.name}
            </h2>
            <span className="text-xs text-muted-foreground bg-gray-100 px-2.5 py-1 rounded-full">
              {group.items.length} {group.items.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.3 }}
          >
            {group.items.map((item: CatalogItem, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                <ProductCard item={item} index={index} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      ))}
    </div>
  );
}
