"use client"

import { useState, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from './product-card';
import { normalizeItems } from '../normalize-items';
import { getTextColors } from '../theme-utils';
import type { CatalogItem } from '../types';

interface ProductGridProps {
  categories: any[];
  activeCategory: string;
  searchQuery: string;
  onClearSearch: () => void;
  catalogLayout?: string;
  groupColor?: string | null;
  backgroundColor?: string | null;
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

export default function ProductGrid({ categories, activeCategory, searchQuery, onClearSearch, catalogLayout = 'list', groupColor, backgroundColor }: ProductGridProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const bgTheme = useMemo(() => getTextColors(backgroundColor), [backgroundColor]);

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
          <div
            className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-md"
            style={{ backgroundColor: bgTheme.subtleBg }}
          >
            <Search className="h-7 w-7" style={{ color: bgTheme.textMuted }} />
          </div>
          <h3 className="font-tomato text-lg font-semibold mb-2" style={{ color: bgTheme.text }}>
            Nenhum produto encontrado
          </h3>
          <p className="text-sm mb-6" style={{ color: bgTheme.textMuted }}>
            {searchQuery
              ? `Nenhum resultado para "${searchQuery}".`
              : 'Nao ha produtos disponiveis no momento.'}
          </p>
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="px-6 py-2.5 text-sm font-medium rounded-md transition-colors"
              style={{
                backgroundColor: bgTheme.isDark ? '#F9FAFB' : '#111827',
                color: bgTheme.isDark ? '#111827' : '#FFFFFF',
              }}
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
                  className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                  style={{ color: bgTheme.textMuted }}
                />
                <h2 className="font-tomato text-lg font-bold" style={{ color: bgTheme.text }}>
                  {group.attributes.name}
                </h2>
              </div>
              <span
                className="text-sm rounded-md px-3 py-1"
                style={{
                  color: bgTheme.textMuted,
                  border: `1px solid ${bgTheme.border}`,
                }}
              >
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
                  {catalogLayout === 'list' ? (
                    <div className="space-y-3">
                      {group.items.map((item: CatalogItem, index: number) => (
                        <ProductCard key={item.id} item={item} index={index} layout="list" groupColor={groupColor} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                      {group.items.map((item: CatalogItem, index: number) => (
                        <ProductCard key={item.id} item={item} index={index} layout="grid" groupColor={groupColor} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}
    </div>
  );
}
