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

  const filteredCategories = categories.map(group => ({
    ...group,
    items: normalizeItems(group.attributes.items).filter(item => 
      item.attributes.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.attributes.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  if (filteredCategories.length === 0) {
    return (
      <motion.div 
        className="col-span-full py-20 px-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto max-w-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground mb-8 text-lg">
            {searchQuery 
              ? `Não encontramos nenhum produto correspondente a "${searchQuery}". Tente outros termos.`
              : "Não há produtos disponíveis no momento."}
          </p>
          {searchQuery && (
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
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
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-12">
      {filteredCategories.map((group, groupIndex) => (
        <section 
          key={group.id} 
          id={group.attributes.name.toLowerCase().replace(/\s+/g, '-')}
          className="scroll-mt-48 group/section"
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover/section:text-primary transition-colors">
              {group.attributes.name}
            </h2>
            <div className="flex gap-2">
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {group.items.length} itens
              </span>
            </div>
          </div>
          
          <div className="relative -mx-4 px-4">
            <motion.div 
              className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-6 pt-2"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
            >
              {group.items.map((item: CatalogItem, index: number) => (
                <div 
                  key={item.id} 
                  className="flex-shrink-0 w-[240px] sm:w-[300px] md:w-[350px]"
                >
                  <ProductCard item={item} index={index} />
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      ))}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}