"use client"

import { useState } from 'react';
import { Scale, ChevronRight, Utensils, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '../format-price';
import { CatalogItem } from '../types';
import ProductModal from '../product-detail';

interface ProductCardProps {
  item: CatalogItem;
  index: number;
}

export default function ProductCard({ item, index }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { attributes } = item;

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        delay: index * 0.05
      }
    }
  };

  const hasDiscount = attributes.price_with_discount !== null && 
                      attributes.price_with_discount !== undefined &&
                      Number(attributes.price_with_discount) < Number(attributes.price);

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="h-full"
    >
      <ProductModal 
        product={item} 
        trigger={
          <motion.div 
            className="group relative bg-card hover:bg-muted/30 rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden shadow-sm hover:shadow-xl"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ y: -6 }}
          >
            {/* Image - Top */}
            <div className="relative aspect-[4/3] w-full flex-shrink-0 overflow-hidden bg-muted">
              {attributes.image_url ? (
                <motion.img 
                  src={attributes.image_url} 
                  alt={attributes.name}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1 }}
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  transition={{ duration: 0.6 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/20">
                  <Utensils className="w-12 h-12 text-muted-foreground/20" />
                </div>
              )}
              
              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-green-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                  {Math.round(
                    ((Number(attributes.price) - Number(attributes.price_with_discount)) / Number(attributes.price) * 100)
                  )}% OFF
                </div>
              )}
            </div>

            {/* Content - Bottom */}
            <div className="p-4 flex flex-col flex-1 min-w-0">
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors leading-tight mb-1">
                  {attributes.name}
                </h3>
                
                {attributes.description && (
                  <p className="text-muted-foreground text-xs line-clamp-2 leading-tight mb-3">
                    {attributes.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  {hasDiscount ? (
                    <>
                      <span className="text-green-600 dark:text-green-500 font-bold text-base">
                        {formatPrice(Number(attributes.price_with_discount))}
                      </span>
                      <span className="text-muted-foreground text-[10px] line-through -mt-1">
                        {formatPrice(Number(attributes.price))}
                      </span>
                    </>
                  ) : (
                    <span className="text-foreground font-bold text-base">
                      {formatPrice(Number(attributes.price))}
                    </span>
                  )}
                </div>

                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                  <Plus className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </motion.div>
        }
      />
    </motion.div>
  );
}