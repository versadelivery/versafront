"use client"

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  attributes: {
    name: string;
    description?: string;
  };
}

interface CategoryNavigationProps {
  categories: Category[];
  activeCategory: string;
  onChange: (category: string) => void;
}

export default function CategoryNavigation({ categories, activeCategory, onChange }: CategoryNavigationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const scrollToCategory = (categoryName: string) => {
    onChange(categoryName);
    const element = document.getElementById(categoryName.toLowerCase().replace(/\s+/g, '-'));
    if (element) {
      const offset = 160; // header (64px) + search/nav bar (~96px)
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
        <button
          onClick={() => scrollToCategory('all')}
          className={`
            whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200
            ${activeCategory === 'all' 
              ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105' 
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'}
          `}
        >
          Tudo
        </button>
        
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => scrollToCategory(category.attributes.name)}
            className={`
              whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200
              ${activeCategory === category.attributes.name 
                ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'}
            `}
          >
            {category.attributes.name}
          </button>
        ))}
      </div>
      
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