"use client"

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
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

  const tabVariants = {
    inactive: { opacity: 0.7, scale: 0.95 },
    active: { opacity: 1, scale: 1 }
  };

  return (
    <>
      <div className="md:hidden w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Select value={activeCategory} onValueChange={onChange}>
            <SelectTrigger className="w-full h-12 border-2 rounded-full px-4 flex items-center justify-between bg-background">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                Todos os produtos
              </SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.attributes.name} className="cursor-pointer">
                  {category.attributes.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      <motion.div 
        className="hidden md:block w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs value={activeCategory} onValueChange={onChange} className="w-full">
          <TabsList className="w-full flex gap-1 p-1 bg-muted/50 rounded-full h-12">
            <motion.div 
              className="flex-1"
              variants={tabVariants}
              initial="inactive"
              animate={activeCategory === 'all' ? 'active' : 'inactive'}
              transition={{ duration: 0.2 }}
            >
              <TabsTrigger 
                value="all" 
                className="flex-1 w-full py-2.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-medium text-sm data-[state=active]:shadow-sm transition-all duration-200"
              >
                Todos os produtos
              </TabsTrigger>
            </motion.div>
            
            {categories.map(category => (
              <motion.div 
                key={category.id}
                className="flex-1"
                variants={tabVariants}
                initial="inactive"
                animate={activeCategory === category.attributes.name ? 'active' : 'inactive'}
                transition={{ duration: 0.2 }}
              >
                <TabsTrigger 
                  value={category.attributes.name}
                  className="flex-1 w-full py-2.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-medium text-sm data-[state=active]:shadow-sm transition-all duration-200"
                >
                  {category.attributes.name}
                </TabsTrigger>
              </motion.div>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>
    </>
  );
}