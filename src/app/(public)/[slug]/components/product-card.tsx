"use client"

import { useState } from 'react';
import { Scale, ChevronRight, Utensils } from 'lucide-react';
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
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4
      }
    }
  };

  const getMeasureType = () => {
    if (attributes.item_type === 'weight_per_kg') {
      return `${attributes.min_weight || 0}kg - ${attributes.max_weight || 0}kg`;
    }
    return 'Unidade';
  };

  const hasDiscount = attributes.price_with_discount !== null && 
                      attributes.price_with_discount !== undefined &&
                      attributes.price_with_discount < attributes.price;

  return (
    <motion.div
      variants={itemVariants}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
    >
      <ProductModal 
        product={item} 
        trigger={
          <motion.div 
            className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col h-full group"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative pt-[75%] overflow-hidden bg-muted/30">
              {attributes.image_url ? (
                <motion.img 
                  src={attributes.image_url} 
                  alt={attributes.name}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  initial={{ scale: 1 }}
                  animate={{ scale: isHovered ? 1.05 : 1 }}
                  transition={{ duration: 0.4 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                  }}
                />
              ) : (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-muted/20">
                  <Utensils className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
              
              {/* Tags centralizadas no topo, com largura adaptada ao texto */}
              <div className="absolute top-2 inset-x-0 flex flex-col items-start pl-2 gap-1.5 z-10 pointer-events-none">
                {attributes.new_tag && (
                  <div className="bg-green-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                    NOVO!
                  </div>
                )}
                {attributes.best_seller_tag && (
                  <div className="bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                    MAIS VENDIDO
                  </div>
                )}
                {attributes.highlight && (
                  <div className="bg-yellow-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                    DESTAQUE
                  </div>
                )}
              </div>
              
              {/* Tag de desconto/promoção no canto superior direito */}
              {(hasDiscount || attributes.promotion_tag) && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-md z-10 whitespace-nowrap">
                  {hasDiscount && parseFloat(attributes.price_with_discount || '0') < parseFloat(attributes.price) ? (
                    (() => {
                      const discountPercent = Math.round(
                        ((parseFloat(attributes.price) - parseFloat(attributes.price_with_discount || '0')) / parseFloat(attributes.price)) * 100
                      );
                      return discountPercent > 0 ? `${discountPercent}% OFF` : 'PROMOÇÃO';
                    })()
                  ) : 'PROMOÇÃO'}
                </div>
              )}
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex-grow">
                <h3 className="font-semibold text-foreground text-base sm:text-lg line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                  {attributes.name}
                </h3>
                
                {attributes.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {attributes.description}
                  </p>
                )}
              </div>

              <div className="mt-auto">
                {hasDiscount ? (
                  <div className="flex items-end gap-2">
                    <span className="text-primary font-bold text-lg sm:text-xl">
                      {formatPrice(attributes.price_with_discount)}
                    </span>
                    <span className="text-muted-foreground text-xs sm:text-sm line-through mb-0.5">
                      {formatPrice(attributes.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-foreground font-bold text-lg sm:text-xl">
                    {formatPrice(attributes.price)}
                  </span>
                )}
                
                <div className="flex justify-between items-center mt-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                      <Scale className="w-3 h-3 text-primary" />
                      {getMeasureType()}
                    </span>
                  </div>

                  <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: isHovered ? 3 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-5 h-5 text-primary" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        }
      />
    </motion.div>
  );
}