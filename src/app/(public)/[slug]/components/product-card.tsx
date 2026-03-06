"use client"

import { memo } from 'react';
import { Utensils } from 'lucide-react';
import { formatPrice } from '../format-price';
import { CatalogItem } from '../types';
import ProductModal from '../product-detail';

interface ProductCardProps {
  item: CatalogItem;
  index: number;
}

const ProductCard = memo(function ProductCard({ item, index }: ProductCardProps) {
  const { attributes } = item;

  const hasDiscount = attributes.price_with_discount !== null &&
    attributes.price_with_discount !== undefined &&
    Number(attributes.price_with_discount) < Number(attributes.price);

  const hasImage = !!attributes.image_url;
  const hasComplements = attributes.shared_complements?.data?.length > 0;
  const hasCustomization = hasComplements || attributes.extra?.data?.length > 0 || attributes.steps?.data?.length > 0;

  return (
    <ProductModal
      product={item}
      trigger={
        <div className="group relative bg-white border border-[#E5E2DD] rounded-md hover:border-gray-400 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col h-full overflow-hidden">
          {/* Image */}
          <div className="relative aspect-[4/3] w-full flex-shrink-0 overflow-hidden bg-[#F0EFEB]">
            {hasImage ? (
              <img
                src={attributes.image_url!}
                alt={attributes.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Utensils className="w-8 h-8 text-gray-300" />
              </div>
            )}

            {/* Tags top-left */}
            <div className="absolute top-0 left-0 flex flex-col z-10">
              {attributes.new_tag && (
                <div className="bg-[#2D4A3E] text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide">
                  Novo
                </div>
              )}
              {attributes.best_seller_tag && (
                <div className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide">
                  Mais vendido
                </div>
              )}
              {attributes.highlight && (
                <div className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide">
                  Destaque
                </div>
              )}
            </div>

            {/* Discount badge top-right */}
            {(hasDiscount || attributes.promotion_tag) && (
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2.5 py-1 z-10 uppercase tracking-wide">
                {hasDiscount
                  ? `${Math.round(((Number(attributes.price) - Number(attributes.price_with_discount)) / Number(attributes.price)) * 100)}% OFF`
                  : 'Promo'}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-2.5 sm:p-3 flex flex-col flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-xs sm:text-sm leading-snug line-clamp-2 mb-1">
              {attributes.name}
            </h3>

            {attributes.description && (
              <p className="text-gray-500 text-[11px] sm:text-xs line-clamp-1 mb-1.5">
                {attributes.description}
              </p>
            )}

            {hasCustomization && (
              <p className="text-[10px] sm:text-[11px] text-primary font-medium mb-1.5">Personalizavel</p>
            )}

            <div className="mt-auto">
              {hasDiscount ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-gray-900 text-sm">
                    {formatPrice(Number(attributes.price_with_discount))}
                  </span>
                  <span className="text-gray-400 text-[10px] sm:text-xs line-through">
                    {formatPrice(Number(attributes.price))}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-gray-900 text-sm">
                  {formatPrice(Number(attributes.price))}
                </span>
              )}
            </div>
          </div>
        </div>
      }
    />
  );
});

export default ProductCard;
