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

  const hasImage = !!attributes.image_url;

  return (
    <ProductModal
      product={item}
      trigger={
        <div className="group relative bg-white hover:bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full overflow-hidden">
          {/* Image */}
          <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden bg-gray-100">
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
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <Utensils className="w-8 h-8 text-gray-200" />
              </div>
            )}

            {/* Tags no canto superior esquerdo (sobre a imagem) */}
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

            {/* Badge de desconto/promoção no canto superior direito */}
            {hasImage && (hasDiscount || attributes.promotion_tag) && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10 whitespace-nowrap">
                {hasDiscount
                  ? `${Math.round(((Number(attributes.price) - Number(attributes.price_with_discount)) / Number(attributes.price)) * 100)}% OFF`
                  : 'PROMOÇÃO'}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3 flex flex-col flex-1 min-w-0">
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
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {hasDiscount
                      ? `${Math.round(((Number(attributes.price) - Number(attributes.price_with_discount)) / Number(attributes.price)) * 100)}% OFF`
                      : 'PROMOÇÃO'}
                  </div>
                )}
              </div>
            )}

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
