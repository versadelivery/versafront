"use client"

import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from './product-card';
import { normalizeItems } from '../normalize-items';
import type { CatalogItem } from '../types';

interface ProductGridProps {
  categories: any[];
  activeCategory: string;
  searchQuery: string;
  onClearSearch: () => void;
}

const DAY_KEYS = [
  'sunday_active',
  'monday_active',
  'tuesday_active',
  'wednesday_active',
  'thursday_active',
  'friday_active',
  'saturday_active',
] as const;

function isItemActiveToday(item: CatalogItem): boolean {
  const attrs = item.attributes as any;
  const dayKey = DAY_KEYS[new Date().getDay()];
  if (attrs[dayKey] === undefined) return true;
  return !!attrs[dayKey];
}

export default function ProductGrid({ categories, activeCategory, searchQuery, onClearSearch }: ProductGridProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (id: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredCategories = categories.map(group => ({
    ...group,
    items: normalizeItems(group.attributes.items).filter((item: CatalogItem) =>
      isItemActiveToday(item) && (
        item.attributes.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.attributes.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  })).filter(group => group.items.length > 0);


  if (filteredCategories.length === 0) {
    return (
      <div className="py-20 px-4 text-center">
        <div className="mx-auto max-w-sm">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-sm text-gray-500 mb-6">
            {searchQuery
              ? `Nenhum resultado para "${searchQuery}".`
              : 'Nao ha produtos disponiveis no momento.'}
          </p>
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
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
      {filteredCategories.map((group) => {
        const isCollapsed = collapsedGroups.has(group.id);

        return (
          <section
            key={group.id}
            id={group.attributes.name.toLowerCase().replace(/\s+/g, '-')}
            className="scroll-mt-40"
          >
            <div
              className="flex items-center justify-between mb-5 cursor-pointer select-none"
              onClick={() => toggleGroup(group.id)}
            >
              <div className="flex items-center gap-2.5">
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                />
                <h2 className="text-lg font-bold text-gray-900">
                  {group.attributes.name}
                </h2>
              </div>
              <span className="text-sm text-gray-500 border border-[#E5E2DD] rounded-md px-3 py-1">
                {group.items.length} {group.items.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {group.items.map((item: CatalogItem, index: number) => (
                      <ProductCard key={item.id} item={item} index={index} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}
    </div>
  );
}
