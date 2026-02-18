import React, { useState } from 'react';
import { CatalogItem } from './types';
import { Utensils, PlusCircle, ChevronRight, Scale } from 'lucide-react';
import { formatPrice } from './format-price';
import ProductModal from './product-detail';

interface ItemCardProps {
  item: CatalogItem;
  onClick?: () => void;
  className?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick, className }) => {
  const { attributes } = item;

  const handleClick = () => {
    onClick?.();
  };

  const getMeasureType = () => {
    if (attributes.item_type === 'weight_per_kg') {
      return `${attributes.min_weight || 0}kg - ${attributes.max_weight || 0}kg`;
    }
    return 'Unidade';
  };

  const hasDiscount = attributes.price_with_discount !== null && 
                      attributes.price_with_discount !== undefined &&
                      Number(attributes.price_with_discount) < Number(attributes.price);

  const discountPercent = hasDiscount
    ? Math.round(((Number(attributes.price) - Number(attributes.price_with_discount)) / Number(attributes.price)) * 100)
    : 0;

  const hasImage = !!attributes.image_url;

  return (
    <>
      <ProductModal 
        product={item} 
        trigger={
          <div 
            onClick={handleClick}
            className={`bg-white rounded-xs shadow-sm hover:shadow-md overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full group ${className}`}
          >
            <div className="relative pt-[75%] overflow-hidden">
              {hasImage ? (
                <img 
                  src={attributes.image_url!} 
                  alt={attributes.name}
                  className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                  }}
                />
              ) : (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-100">
                  <Utensils className="w-12 h-12 text-gray-300" />
                </div>
              )}

              {/* Tags no canto superior esquerdo */}
              {hasImage && (
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                  {attributes.new_tag && (
                    <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                      NOVO!
                    </div>
                  )}
                  {attributes.best_seller_tag && (
                    <div className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                      MAIS VENDIDO
                    </div>
                  )}
                  {attributes.highlight && (
                    <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                      DESTAQUE
                    </div>
                  )}
                </div>
              )}

              {/* Badge de desconto */}
              {(hasDiscount || attributes.promotion_tag) && (
                <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
                  {hasDiscount ? `${discountPercent}% OFF` : 'PROMOÇÃO'}
                </div>
              )}
            </div>
            
            <div className="p-3 sm:p-4 flex flex-col flex-grow">
              <div className="flex-grow">
                {/* Tags sem imagem */}
                {!hasImage && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {attributes.new_tag && (
                      <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        NOVO!
                      </div>
                    )}
                    {attributes.best_seller_tag && (
                      <div className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        MAIS VENDIDO
                      </div>
                    )}
                    {attributes.highlight && (
                      <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        DESTAQUE
                      </div>
                    )}
                    {(hasDiscount || attributes.promotion_tag) && (
                      <div className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        {hasDiscount ? `${discountPercent}% OFF` : 'PROMOÇÃO'}
                      </div>
                    )}
                  </div>
                )}

                <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-2 mb-1 sm:mb-2 hover:break-words">
                  {attributes.name}
                </h3>
                
                <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-4">
                  {attributes.description}
                </p>
              </div>

              <div className="mt-auto">
                {hasDiscount ? (
                  <div className="flex items-end gap-1 sm:gap-2">
                    <span className="text-primary font-bold text-lg sm:text-xl">
                      {formatPrice(Number(attributes.price_with_discount))}
                    </span>
                    <span className="text-gray-400 text-xs sm:text-sm line-through mb-0.5">
                      {formatPrice(Number(attributes.price))}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-900 font-bold text-lg sm:text-xl">
                    {formatPrice(Number(attributes.price))}
                  </span>
                )}
                
                <div className="flex justify-between items-center mt-1 sm:mt-2">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <span className="text-[10px] sm:text-xs text-gray-600 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1">
                      <Scale className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                      {getMeasureType()}
                    </span>
                  </div>

                  <button className="text-primary hover:text-primary-dark transition-colors">
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      />
    </>
  );
};

export default ItemCard;