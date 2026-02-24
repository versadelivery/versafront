"use client";

import { Package, Scale, Plus, ChefHat, ListChecks, Loader2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCatalogItem } from "@/hooks/useCatalogGroup";
import { fixImageUrl } from "@/utils/image-url";

// =============================================================================
// TIPOS
// =============================================================================

interface ItemDetailsModalProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
}

// =============================================================================
// CONSTANTES
// =============================================================================

const DAYS_OF_WEEK = [
  { key: 'sunday_active', label: 'Dom' },
  { key: 'monday_active', label: 'Seg' },
  { key: 'tuesday_active', label: 'Ter' },
  { key: 'wednesday_active', label: 'Qua' },
  { key: 'thursday_active', label: 'Qui' },
  { key: 'friday_active', label: 'Sex' },
  { key: 'saturday_active', label: 'Sáb' },
] as const;

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function ItemDetailsModal({ id, isOpen, onClose }: ItemDetailsModalProps) {
  const { catalogItem, isLoadingCatalogItem } = useCatalogItem(id.toString());

  // =============================================================================
  // FUNÇÕES AUXILIARES
  // =============================================================================

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return `R$ ${(num || 0).toFixed(2).replace('.', ',')}`;
  };

  const getItemTypeLabel = (itemType: string) => {
    switch (itemType) {
      case 'weight_per_g': return 'por grama';
      case 'weight_per_kg': return 'por quilo';
      default: return 'por unidade';
    }
  };

  const getWeightUnit = (itemType: string) => {
    return itemType === 'weight_per_g' ? 'g' : 'kg';
  };

  // =============================================================================
  // RENDER - LOADING
  // =============================================================================

  if (isLoadingCatalogItem) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="rounded-lg sm:max-w-[640px] p-0 bg-white">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando detalhes...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // =============================================================================
  // RENDER - ERRO
  // =============================================================================

  if (!catalogItem) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="rounded-lg sm:max-w-[640px] p-0 bg-white">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <p className="text-sm text-muted-foreground">Não foi possível carregar os detalhes do item</p>
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // =============================================================================
  // DADOS DO ITEM
  // =============================================================================

  const attrs = catalogItem.data.attributes;
  const hasImage = !!attrs.image_url;
  const hasDiscount = attrs.price_with_discount && attrs.price_with_discount < attrs.price;
  const isWeightBased = attrs.item_type !== 'unit';
  const hasExtras = attrs.extra?.data && attrs.extra.data.length > 0;
  const hasPrepareMethods = attrs.prepare_method?.data && attrs.prepare_method.data.length > 0;
  const hasSteps = attrs.steps?.data && attrs.steps.data.length > 0;

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-lg sm:max-w-[640px] p-0 bg-white max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5" />
            Detalhes do Item
          </DialogTitle>
        </DialogHeader>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          {/* Imagem */}
          {hasImage && (
            <div className="relative h-48 w-full bg-gray-50">
              <Image
                src={fixImageUrl(attrs.image_url) || ''}
                alt={attrs.name}
                fill
                sizes="640px"
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <div className="px-6 py-5 space-y-5">
            {/* Nome e Descrição */}
            <div>
              <h2 className="text-xl font-bold text-foreground">{attrs.name}</h2>
              {attrs.description && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{attrs.description}</p>
              )}
            </div>

            {/* Preço */}
            <div className="rounded-lg p-4 border border-gray-100 bg-white">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Preço</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {formatPrice(hasDiscount ? attrs.price_with_discount! : attrs.price)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(attrs.price)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{getItemTypeLabel(attrs.item_type)}</p>
            </div>

            {/* Tags visuais */}
            {((attrs as any).new_tag || (attrs as any).best_seller_tag || (attrs as any).highlight || (attrs as any).promotion_tag) && (
              <div className="flex flex-wrap gap-2">
                {(attrs as any).new_tag && (
                  <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">NOVO!</span>
                )}
                {(attrs as any).best_seller_tag && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">+ VENDIDO</span>
                )}
                {(attrs as any).highlight && (
                  <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">DESTAQUE</span>
                )}
                {(attrs as any).promotion_tag && (
                  <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">PROMOÇÃO</span>
                )}
              </div>
            )}

            {/* Peso */}
            {isWeightBased && (attrs.min_weight || attrs.max_weight) && (
              <div className="rounded-lg p-4 border border-gray-100 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Peso</span>
                </div>
                {attrs.min_weight && attrs.max_weight && (
                  <p className="text-sm">De {attrs.min_weight} até {attrs.max_weight} {getWeightUnit(attrs.item_type)}</p>
                )}
                {attrs.measure_interval && (
                  <p className="text-xs text-muted-foreground mt-1">Intervalo: {attrs.measure_interval} {getWeightUnit(attrs.item_type)}</p>
                )}
              </div>
            )}

            {/* Dias da Semana */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Dias Disponíveis</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {DAYS_OF_WEEK.map(({ key, label }) => (
                  <div
                    key={key}
                    className={`py-2 rounded-md text-sm font-medium text-center ${
                      (attrs as any)[key] !== false ? 'bg-foreground text-white' : 'bg-muted/40 text-muted-foreground line-through'
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Adicionais */}
            {hasExtras && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Plus className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Adicionais</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {attrs.extra!.data.map((extra: any, index: number) => (
                    <div key={extra.id || index} className="px-3 py-2 rounded-full border border-gray-100 bg-white">
                      <span className="text-sm font-medium">{extra.attributes.name}</span>
                      {Number(extra.attributes.price) > 0 && (
                        <span className="text-xs text-primary ml-1.5">+ {formatPrice(parseFloat(extra.attributes.price))}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modos de Preparo */}
            {hasPrepareMethods && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ChefHat className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Modos de Preparo</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {attrs.prepare_method!.data.map((method: any, index: number) => (
                    <div key={method.id || index} className="px-3 py-2 rounded-full border border-gray-100 bg-white">
                      <span className="text-sm font-medium">{method.attributes.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Etapas */}
            {hasSteps && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Etapas de Montagem</span>
                </div>
                <div className="space-y-2">
                  {attrs.steps!.data.map((step: any, index: number) => (
                    <div key={step.id || index} className="flex gap-3 p-3 rounded-lg border border-gray-100 bg-white">
                      <div className="w-6 h-6 rounded-full bg-foreground text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{step.attributes.name}</p>
                        {step.attributes.options?.data?.length > 0 && (
                          <div className="mt-1.5 space-y-0.5">
                            {step.attributes.options.data.map((option: any, optIndex: number) => (
                              <p key={option.id || optIndex} className="text-xs text-muted-foreground">
                                • {option.attributes.name}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
