"use client"

import { Utensils, Plus } from 'lucide-react';
import { formatPrice } from '../format-price';
import { CatalogItem } from '../types';
import ProductModal from '../product-detail';

interface ProductCardProps {
  item: CatalogItem;
  index: number;
}

export default function ProductCard({ item, index }: ProductCardProps) {
  const { attributes } = item;

  const hasDiscount = attributes.price_with_discount !== null &&
    attributes.price_with_discount !== undefined &&
    Number(attributes.price_with_discount) < Number(attributes.price);

  return (
    <ProductModal
      product={item}
      trigger={
        <div className="group relative bg-white hover:bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full overflow-hidden">
          {/* Image */}
          <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden bg-gray-100">
            {attributes.image_url ? (
              <img
                src={attributes.image_url}
                alt={attributes.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <Utensils className="w-8 h-8 text-gray-200" />
              </div>
            )}

            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {Math.round(
                  ((Number(attributes.price) - Number(attributes.price_with_discount)) /
                    Number(attributes.price)) *
                    100
                )}% OFF
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3 flex flex-col flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-xs sm:text-sm line-clamp-2 leading-snug mb-1 group-hover:text-primary transition-colors">
              {attributes.name}
            </h3>

            {attributes.description && (
              <p className="text-muted-foreground text-[11px] line-clamp-1 mb-2">
                {attributes.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                {hasDiscount ? (
                  <>
                    <span className="text-primary font-bold text-sm">
                      {formatPrice(Number(attributes.price_with_discount))}
                    </span>
                    <span className="text-muted-foreground text-[10px] line-through leading-none">
                      {formatPrice(Number(attributes.price))}
                    </span>
                  </>
                ) : (
                  <span className="text-foreground font-bold text-sm">
                    {formatPrice(Number(attributes.price))}
                  </span>
                )}
              </div>

              <div className="w-7 h-7 rounded-full bg-primary/10 group-hover:bg-primary flex items-center justify-center transition-colors flex-shrink-0">
                <Plus className="w-3.5 h-3.5 text-primary group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
