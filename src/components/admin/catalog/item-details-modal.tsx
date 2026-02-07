import { X, Package, Info, Scale, Clock, Plus, ChefHat, ListChecks, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCatalogItem } from "../../../hooks/useCatalogGroup";
import { fixImageUrl } from "@/utils/image-url";

interface ItemDetailsModalProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailsModal({ id, isOpen, onClose }: ItemDetailsModalProps) {
  const { catalogItem, isLoadingCatalogItem } = useCatalogItem(id.toString());
  const item = catalogItem;

  const getName = (obj: any) => {
    if (!obj) return null;
    return obj.attributes?.name || obj.name || obj.attributes?.description || obj.description || null;
  };

  if (isLoadingCatalogItem) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="flex justify-center items-center min-h-[300px] bg-white rounded-3xl border-none shadow-2xl">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </DialogContent>
      </Dialog>
    );
  }

  const attrs = item?.data?.attributes;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[800px] p-0 bg-white border-none shadow-2xl rounded-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Banner Area */}
        <div className="relative h-64 sm:h-80 w-full bg-muted/20 overflow-hidden flex-shrink-0">
          {attrs?.image_url ? (
            <Image
              src={fixImageUrl(attrs.image_url) || ''}
              alt={attrs.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <Package className="h-24 w-24 text-muted-foreground/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-8 right-8">
            <h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md tracking-tight">
              {attrs?.name}
            </h2>
          </div>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-10 custom-scrollbar">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="flex-1 space-y-4">
              <h4 className="text-xs uppercase tracking-widest font-bold text-muted-foreground/60">Descrição do Produto</h4>
              {attrs?.description ? (
                <p className="text-gray-600 text-lg leading-relaxed font-medium">
                  {attrs.description}
                </p>
              ) : (
                <p className="text-muted-foreground/40 italic font-medium">Nenhuma descrição detalhada informada.</p>
              )}
            </div>

            <div className="flex flex-col gap-6 min-w-[240px] bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest font-black text-primary/70">Preço Principal</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">
                    R$ {attrs?.price_with_discount ? attrs.price_with_discount.toFixed(2).replace('.', ',') : attrs?.price.toFixed(2).replace('.', ',')}
                  </span>
                  {attrs?.price_with_discount && (
                    <span className="text-sm font-bold text-muted-foreground/40 line-through">
                      R$ {attrs.price.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-muted-foreground/60 uppercase">
                  Cobrado por {attrs?.item_type === 'weight_per_g' ? 'grama' : attrs?.item_type === 'weight_per_kg' ? 'quilo' : 'unidade'}
                </p>
              </div>

              {attrs?.item_type !== 'unit' && (
                <div className="space-y-3 pt-4 border-t border-gray-200/50">
                  <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                    <Scale className="h-4 w-4 text-primary" />
                    Especificações de Peso
                  </div>
                  <div className="space-y-2">
                    {attrs?.min_weight && attrs?.max_weight && (
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-muted-foreground/60">Variação:</span>
                        <span className="text-gray-800">{attrs.min_weight} - {attrs.max_weight} {attrs.item_type === 'weight_per_g' ? 'g' : 'kg'}</span>
                      </div>
                    )}
                    {attrs?.measure_interval && (
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-muted-foreground/60">Intervalo:</span>
                        <span className="text-gray-800 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 opacity-60" />
                          {attrs.measure_interval} {attrs.item_type === 'weight_per_g' ? 'g' : 'kg'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {attrs?.extra && attrs.extra.data.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-black text-gray-800 flex items-center gap-3 uppercase tracking-widest">
                  <Plus className="h-5 w-5 text-primary" />
                  Adicionais Disponíveis
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {attrs.extra.data.map((extra: any, index: number) => {
                    const name = getName(extra);
                    return name ? (
                      <div key={index} className="flex justify-between items-center p-3 sm:p-4 bg-gray-50/50 rounded-2xl border border-gray-100 font-semibold text-gray-700">
                        <span>{name}</span>
                        {Number(extra.attributes?.price) > 0 && (
                          <span className="text-primary/70 text-xs">+ R$ {Number(extra.attributes.price).toFixed(2).replace('.', ',')}</span>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {attrs?.prepare_method && attrs.prepare_method.data.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-black text-gray-800 flex items-center gap-3 uppercase tracking-widest">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Métodos de Preparo
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {attrs.prepare_method.data.map((method: any, index: number) => {
                    const name = getName(method);
                    return name ? (
                      <div key={index} className="p-3 sm:p-4 bg-gray-50/50 rounded-2xl border border-gray-100 font-semibold text-gray-700">
                        {name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {attrs?.steps && attrs.steps.data.length > 0 && (
              <div className="space-y-4 md:col-span-2">
                <h4 className="text-sm font-black text-gray-800 flex items-center gap-3 uppercase tracking-widest">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Etapas e Personalização
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {attrs.steps.data.map((step: any, index: number) => {
                    const name = getName(step);
                    return name ? (
                      <div key={index} className="p-4 sm:p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-3">
                        <span className="text-xs uppercase tracking-wider font-black text-primary/70">Passo {index + 1}</span>
                        <p className="font-bold text-gray-800 text-lg">{name}</p>
                        {step.attributes?.options?.data?.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {step.attributes.options.data.map((opt: any, i: number) => (
                              <span key={i} className="px-2 py-1 bg-white rounded-lg border border-gray-100 text-[10px] font-bold text-muted-foreground uppercase">
                                {getName(opt)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <Button onClick={onClose} variant="secondary" className="rounded-2xl px-8 font-bold">
            Fechar Detalhes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}