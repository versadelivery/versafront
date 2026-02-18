"use client";

import { Edit2, Scale, Plus, ChefHat, ListChecks, ImageOff } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { ItemDetailsModal } from "./item-details-modal";
import { EditItemModal } from "./edit-item-modal";
import { fixImageUrl } from "@/utils/image-url";

// =============================================================================
// TIPOS
// =============================================================================

interface ItemCardProps {
  item: {
    id: number;
    catalog_group_id: number;
    name: string;
    description?: string;
    item_type: 'unit' | 'weight_per_kg' | 'weight_per_g';
    price: number;
    price_with_discount?: number;
    min_weight?: number;
    max_weight?: number;
    measure_interval?: number;
    image?: string;
    new_tag?: boolean;
    best_seller_tag?: boolean;
    highlight?: boolean;
    promotion_tag?: boolean;
    catalog_item_extras_attributes?: any[];
    catalog_item_prepare_methods_attributes?: any[];
    catalog_item_steps_attributes?: any[];
  };
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function ItemCard({ item }: ItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // =============================================================================
  // FUNÇÕES AUXILIARES
  // =============================================================================

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const getItemTypeLabel = () => {
    switch (item.item_type) {
      case 'weight_per_g': return 'por g';
      case 'weight_per_kg': return 'por kg';
      default: return '';
    }
  };

  const getWeightUnit = () => {
    return item.item_type === 'weight_per_g' ? 'g' : 'kg';
  };

  const getName = (obj: any) => {
    if (!obj) return null;
    if (obj.attributes) return obj.attributes.name || null;
    return obj.name || null;
  };

  const hasDiscount = item.price_with_discount && item.price_with_discount < item.price;
  const discountPercentage = hasDiscount
    ? Math.round((item.price - item.price_with_discount!) / item.price * 100)
    : null;

  const hasExtras = item.catalog_item_extras_attributes && item.catalog_item_extras_attributes.length > 0;
  const hasPrepareMethods = item.catalog_item_prepare_methods_attributes && item.catalog_item_prepare_methods_attributes.length > 0;
  const hasSteps = item.catalog_item_steps_attributes && item.catalog_item_steps_attributes.length > 0;
  const hasIndicators = hasExtras || hasPrepareMethods || hasSteps;

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <>
      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
        onClick={() => setIsDetailsOpen(true)}
      >
        {/* Imagem */}
        <div className="relative h-32 w-full">
          {item.image ? (
            <Image
              src={fixImageUrl(item.image) || ''}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <ImageOff className="h-8 w-8 text-muted-foreground/20" />
            </div>
          )}

          {/* Badge desconto */}
          {hasDiscount && (
            <div className="absolute bottom-2 right-2 bg-destructive text-white text-[10px] font-semibold px-2 py-0.5 rounded">
              -{discountPercentage}%
            </div>
          )}

          {/* Tags visuais */}
          <div className="absolute top-2 left-2 flex flex-col gap-0.5">
            {item.new_tag && (
              <div className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                NOVO!
              </div>
            )}
            {item.best_seller_tag && (
              <div className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                + VENDIDO
              </div>
            )}
            {item.highlight && (
              <div className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                DESTAQUE
              </div>
            )}
            {item.promotion_tag && !hasDiscount && (
              <div className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                PROMOÇÃO
              </div>
            )}
          </div>

          {/* Botão editar */}
          <button
            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-md p-1.5 hover:bg-white transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          >
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-3 flex flex-col flex-1 gap-1">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
            {item.name}
          </h3>

          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Preço */}
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-bold text-foreground">
              {formatPrice(hasDiscount ? item.price_with_discount! : item.price)}
              {getItemTypeLabel() && (
                <span className="text-[10px] text-muted-foreground font-normal ml-1">{getItemTypeLabel()}</span>
              )}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(item.price)}
              </span>
            )}
          </div>

          {/* Peso */}
          {item.item_type !== 'unit' && (
            <div className="flex items-center gap-1 mt-0.5">
              <Scale className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                {item.min_weight && item.max_weight
                  ? `${item.min_weight}-${item.max_weight}${getWeightUnit()}`
                  : getWeightUnit()
                }
              </span>
            </div>
          )}

          {/* Indicadores */}
          {hasIndicators && (
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
              {hasExtras && (
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-2.5 w-2.5 text-primary" />
                </div>
              )}
              {hasPrepareMethods && (
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <ChefHat className="h-2.5 w-2.5 text-primary" />
                </div>
              )}
              {hasSteps && (
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <ListChecks className="h-2.5 w-2.5 text-primary" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ItemDetailsModal
        id={item.id}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
      <EditItemModal
        id={item.id.toString()}
        isOpen={isEditing}
        onOpenChange={setIsEditing}
      />
    </>
  );
}
