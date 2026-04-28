"use client";

import { Edit2, Scale, Plus, ChefHat, ListChecks, ImageOff, Copy, Loader2, Link } from "lucide-react";
import { useCatalogGroup } from "@/hooks/useCatalogGroup";
import { useShop } from "@/hooks/use-shop";
import Image from "next/image";
import React, { useState } from "react";
import { ItemDetailsModal } from "./item-details-modal";
import { EditItemModal } from "./edit-item-modal";
import { fixImageUrl } from "@/utils/image-url";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

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
    active: boolean;
    has_out_of_stock_ingredient?: boolean;
    catalog_item_extras_attributes?: any[];
    catalog_item_prepare_methods_attributes?: any[];
    catalog_item_steps_attributes?: any[];
  };
  layout?: 'grid' | 'list';
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function ItemCard({ item, layout = 'grid' }: ItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { duplicateCatalogItem, isDuplicatingItem } = useCatalogGroup();

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateCatalogItem(item.id.toString());
  };
  const { toggleCatalogItemActive } = useCatalogGroup();
  const { shop } = useShop();

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shop?.slug) {
      toast.error("Não foi possível gerar o link");
      return;
    }
    const url = `${window.location.origin}/${shop.slug}?item=${item.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

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

  // ── Modo lista ────────────────────────────────────────────────────────────────
  if (layout === 'list') {
    return (
      <>
        <div
          className={`bg-white border border-[#E5E2DD] rounded-md overflow-hidden cursor-pointer hover:border-primary/40 transition-colors duration-200 flex flex-row items-center gap-3 px-3 py-2.5 ${!item.active ? 'opacity-60' : ''}`}
          onClick={() => setIsDetailsOpen(true)}
        >
          {/* Imagem */}
          <div className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden bg-[#F0EFEB]">
            {item.image ? (
              <Image
                src={fixImageUrl(item.image) || ''}
                alt={item.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageOff className="h-5 w-5 text-muted-foreground/20" />
              </div>
            )}
          </div>

          {/* Nome + descrição */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-foreground truncate">{item.name}</span>
              {item.has_out_of_stock_ingredient && (
                <span className="bg-destructive text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0">INDISPONÍVEL</span>
              )}
              {item.new_tag && <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0">NOVO!</span>}
              {item.best_seller_tag && <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0">+VENDIDO</span>}
              {item.promotion_tag && <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0">PROMOÇÃO</span>}
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>
            )}
          </div>

          {/* Indicadores de customização */}
          {hasIndicators && (
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
              {hasExtras && <div className="w-5 h-5 rounded-full bg-white border border-primary/30 flex items-center justify-center"><Plus className="h-2.5 w-2.5 text-primary" /></div>}
              {hasPrepareMethods && <div className="w-5 h-5 rounded-full bg-white border border-primary/30 flex items-center justify-center"><ChefHat className="h-2.5 w-2.5 text-primary" /></div>}
              {hasSteps && <div className="w-5 h-5 rounded-full bg-white border border-primary/30 flex items-center justify-center"><ListChecks className="h-2.5 w-2.5 text-primary" /></div>}
            </div>
          )}

          {/* Preço */}
          <div className="flex-shrink-0 text-right">
            <div className="text-sm font-bold text-foreground tabular-nums">
              {formatPrice(hasDiscount ? item.price_with_discount! : item.price)}
              {getItemTypeLabel() && <span className="text-[10px] text-muted-foreground font-normal ml-1">{getItemTypeLabel()}</span>}
            </div>
            {hasDiscount && (
              <div className="text-[11px] text-muted-foreground line-through tabular-nums">{formatPrice(item.price)}</div>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button className="cursor-pointer p-1.5 rounded-md hover:bg-[#F0EFEB] text-muted-foreground hover:text-primary transition-colors" onClick={handleCopyLink} title="Copiar link">
              <Link className="h-3.5 w-3.5" />
            </button>
            <button className="cursor-pointer p-1.5 rounded-md hover:bg-[#F0EFEB] text-muted-foreground hover:text-primary transition-colors" onClick={handleDuplicate} disabled={isDuplicatingItem} title="Duplicar">
              {isDuplicatingItem ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button className="cursor-pointer p-1.5 rounded-md hover:bg-[#F0EFEB] text-muted-foreground hover:text-primary transition-colors" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} title="Editar">
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <Switch
              checked={item.active}
              onCheckedChange={(checked) => toggleCatalogItemActive({ id: item.id.toString(), active: checked })}
              className="scale-[0.7] origin-center"
            />
          </div>
        </div>

        <ItemDetailsModal id={item.id} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} />
        <EditItemModal id={item.id.toString()} isOpen={isEditing} onOpenChange={setIsEditing} />
      </>
    );
  }

  // ── Modo grade (padrão) ────────────────────────────────────────────────────
  return (
    <>
      <div
        className={`bg-white rounded-md border border-[#E5E2DD] overflow-hidden cursor-pointer hover:border-primary/40 transition-colors duration-200 flex flex-col h-full ${!item.active ? 'opacity-60' : ''}`}
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
            <div className="w-full h-full flex items-center justify-center bg-[#F0EFEB]">
              <ImageOff className="h-8 w-8 text-muted-foreground/20" />
            </div>
          )}

          {/* Badge desconto */}
          {hasDiscount && (
            <div className="absolute bottom-2 left-2 bg-destructive text-white text-[10px] font-semibold px-2 py-0.5 rounded">
              -{discountPercentage}%
            </div>
          )}

          {/* Botões de Ação */}
          <div className="absolute top-2 right-2 flex items-center gap-2">
            {/* Copiar Link */}
            <button
              className="bg-white/95 cursor-pointer backdrop-blur-sm rounded-full p-2 flex items-center justify-center  border border-[#E5E2DD] hover:bg-white transition-colors group"
              onClick={handleCopyLink}
              title="Copiar link do item"
            >
              <Link className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>

            {/* Duplicar */}
            <button
              className="bg-white/95 cursor-pointer backdrop-blur-sm rounded-full p-2 flex items-center justify-center  border border-[#E5E2DD] hover:bg-white transition-colors group"
              onClick={handleDuplicate}
              disabled={isDuplicatingItem}
              title="Duplicar item"
            >
              {isDuplicatingItem ? (
                <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </button>

            {/* Container Ativo + Editar */}
            <div
              className="bg-white/95 backdrop-blur-sm rounded-full py-1 px-2.5 flex items-center  border border-[#E5E2DD] gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center -ml-1">
                <Switch
                  checked={item.active}
                  onCheckedChange={(checked) => {
                    toggleCatalogItemActive({ id: item.id.toString(), active: checked });
                  }}
                  className="scale-[0.55] origin-center"
                />
              </div>
              <div className="w-[1px] h-3 bg-[#E5E2DD]" />
              <button
                className="cursor-pointer text-muted-foreground hover:text-primary transition-colors py-0.5"
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                title="Editar item"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
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

          {/* Ingrediente indisponível */}
          {item.has_out_of_stock_ingredient && (
            <div className="flex items-center gap-1 mt-1">
              <span className="bg-destructive text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">INGREDIENTE INDISPONÍVEL</span>
            </div>
          )}

          {/* Tags visuais */}
          {(item.new_tag || item.best_seller_tag || item.highlight || item.promotion_tag) && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.new_tag && (
                <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">NOVO!</span>
              )}
              {item.best_seller_tag && (
                <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">+VENDIDO</span>
              )}
              {item.highlight && (
                <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">DESTAQUE</span>
              )}
              {item.promotion_tag && (
                <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">PROMOÇÃO</span>
              )}
            </div>
          )}

          {/* Indicadores */}
          {hasIndicators && (
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#E5E2DD]">
              {hasExtras && (
                <div className="w-5 h-5 rounded-full bg-white border border-primary/30 flex items-center justify-center">
                  <Plus className="h-2.5 w-2.5 text-primary" />
                </div>
              )}
              {hasPrepareMethods && (
                <div className="w-5 h-5 rounded-full bg-white border border-primary/30 flex items-center justify-center">
                  <ChefHat className="h-2.5 w-2.5 text-primary" />
                </div>
              )}
              {hasSteps && (
                <div className="w-5 h-5 rounded-full bg-white border border-primary/30 flex items-center justify-center">
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
