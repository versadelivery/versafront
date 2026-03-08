"use client"

import React, { memo, useMemo } from 'react';
import { Utensils } from 'lucide-react';
import { formatPrice } from '../format-price';
import { CatalogItem } from '../types';
import { getTextColors } from '../theme-utils';
import ProductModal from '../product-detail';

interface ProductCardProps {
  item: CatalogItem;
  index: number;
  layout?: 'grid' | 'list';
  groupColor?: string | null;
}

function Tags({ attributes }: { attributes: any }) {
  return (
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
  );
}

function DiscountBadge({ attributes, hasDiscount }: { attributes: any; hasDiscount: boolean }) {
  if (!hasDiscount && !attributes.promotion_tag) return null;
  return (
    <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2.5 py-1 z-10 uppercase tracking-wide">
      {hasDiscount
        ? `${Math.round(((Number(attributes.price) - Number(attributes.price_with_discount)) / Number(attributes.price)) * 100)}% OFF`
        : 'Promo'}
    </div>
  );
}

const ProductCard = memo(function ProductCard({ item, index, layout = 'grid', groupColor }: ProductCardProps) {
  const { attributes } = item;

  const theme = useMemo(() => getTextColors(groupColor), [groupColor]);

  const hasDiscount = attributes.price_with_discount !== null &&
    attributes.price_with_discount !== undefined &&
    Number(attributes.price_with_discount) < Number(attributes.price);

  const hasImage = !!attributes.image_url;
  const hasComplements = attributes.shared_complements?.data?.length > 0;
  const hasCustomization = hasComplements || attributes.extra?.data?.length > 0 || attributes.steps?.data?.length > 0;

  const cardBg = groupColor || '#FFFFFF';
  const isUnavailable = !!attributes.has_out_of_stock_ingredient;

  const wrapWithModal = (content: React.ReactNode) => {
    if (isUnavailable) {
      return <>{content}</>;
    }
    return <ProductModal product={item} trigger={content} />;
  };

  if (layout === 'list') {
    return wrapWithModal(
          <div
            className={`group relative rounded-md hover:shadow-sm transition-all duration-200 flex flex-row h-auto overflow-hidden ${isUnavailable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${theme.border}`,
            }}
          >
            {/* Content left */}
            <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0 justify-center">
              <h3
                className="font-medium text-sm sm:text-base leading-snug line-clamp-2 mb-1"
                style={{ color: theme.text }}
              >
                {attributes.name}
              </h3>

              {attributes.description && (
                <p
                  className="text-xs sm:text-sm line-clamp-2 mb-2"
                  style={{ color: theme.textMuted }}
                >
                  {attributes.description}
                </p>
              )}

              {hasCustomization && (
                <p className="text-[11px] sm:text-xs text-primary font-medium mb-2">Personalizavel</p>
              )}

              <div>
                {hasDiscount ? (
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-sm sm:text-base" style={{ color: theme.text }}>
                      {formatPrice(Number(attributes.price_with_discount))}
                    </span>
                    <span className="text-xs line-through" style={{ color: theme.textMuted }}>
                      {formatPrice(Number(attributes.price))}
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-sm sm:text-base" style={{ color: theme.text }}>
                    {formatPrice(Number(attributes.price))}
                  </span>
                )}
              </div>
            </div>

            {/* Image right */}
            <div className="relative w-28 sm:w-36 flex-shrink-0 overflow-hidden" style={{ backgroundColor: theme.subtleBg }}>
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
                <div className="w-full h-full flex items-center justify-center min-h-[100px]">
                  <Utensils className="w-8 h-8" style={{ color: theme.textMuted }} />
                </div>
              )}
              <Tags attributes={attributes} />
              <DiscountBadge attributes={attributes} hasDiscount={hasDiscount} />
            </div>
            {isUnavailable && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                <span className="bg-white/95 text-foreground text-xs font-bold px-3 py-1.5 rounded-md">Indisponível</span>
              </div>
            )}
          </div>
    );
  }

  // Grid layout
  return wrapWithModal(
        <div
          className={`group relative rounded-md hover:shadow-sm transition-all duration-200 flex flex-col h-full overflow-hidden ${isUnavailable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${theme.border}`,
          }}
        >
          {/* Image */}
          <div className="relative aspect-[4/3] w-full flex-shrink-0 overflow-hidden" style={{ backgroundColor: theme.subtleBg }}>
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
                <Utensils className="w-8 h-8" style={{ color: theme.textMuted }} />
              </div>
            )}

            <Tags attributes={attributes} />
            <DiscountBadge attributes={attributes} hasDiscount={hasDiscount} />
          </div>

          {/* Content */}
          <div className="p-2.5 sm:p-3 flex flex-col flex-1 min-w-0">
            <h3
              className="font-medium text-xs sm:text-sm leading-snug line-clamp-2 mb-1"
              style={{ color: theme.text }}
            >
              {attributes.name}
            </h3>

            {attributes.description && (
              <p
                className="text-[11px] sm:text-xs line-clamp-1 mb-1.5"
                style={{ color: theme.textMuted }}
              >
                {attributes.description}
              </p>
            )}

            {hasCustomization && (
              <p className="text-[10px] sm:text-[11px] text-primary font-medium mb-1.5">Personalizavel</p>
            )}

            <div className="mt-auto">
              {hasDiscount ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-sm" style={{ color: theme.text }}>
                    {formatPrice(Number(attributes.price_with_discount))}
                  </span>
                  <span className="text-[10px] sm:text-xs line-through" style={{ color: theme.textMuted }}>
                    {formatPrice(Number(attributes.price))}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-sm" style={{ color: theme.text }}>
                  {formatPrice(Number(attributes.price))}
                </span>
              )}
            </div>
          </div>
          {isUnavailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 rounded-md">
              <span className="bg-white/95 text-foreground text-xs font-bold px-3 py-1.5 rounded-md">Indisponível</span>
            </div>
          )}
        </div>
  );
});

export default ProductCard;
