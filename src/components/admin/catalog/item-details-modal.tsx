import { X, Package, Info, Scale, Clock, Plus, ChefHat, ListChecks, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCatalogItem } from "../../../app/admin/catalog/useCatalogGroup";

interface ItemDetailsModalProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailsModal({ id, isOpen, onClose }: ItemDetailsModalProps) {
  const { catalogItem, isLoadingCatalogItem } = useCatalogItem(id.toString());
  const item = catalogItem;


  if (isLoadingCatalogItem) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="flex justify-center items-center h-full">
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <Loader2 className="h-10 w-10 animate-spin" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-xs sm:h-auto max-w-[95vw] sm:max-w-[720px] p-4 sm:p-6 md:p-8 bg-white rounded-sm max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#212121] [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar]:px-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detalhes do Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {item?.data.attributes.image_url && (
            <div className="relative h-64 w-full rounded-lg overflow-hidden">
              <Image
                src={item.data.attributes.image_url}
                alt={item.data.attributes.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{item?.data.attributes.name}</h3>
              {item?.data.attributes.description && (
                <p className="text-gray-600 mt-2 flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {item?.data.attributes.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Preço</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    R$ {item?.data.attributes.price_with_discount ? item?.data.attributes.price_with_discount.toFixed(2).replace('.', ',') : item?.data.attributes.price.toFixed(2).replace('.', ',')}
                  </span>
                  {item?.data.attributes.price_with_discount && (
                    <span className="text-sm text-gray-500 line-through">
                      R$ {item?.data.attributes.price.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {item?.data.attributes.item_type === 'weight_per_g' ? 'por grama' : item?.data.attributes.item_type === 'weight_per_kg' ? 'por quilo' : 'unidade'}
                </span>
              </div>

              {item?.data.attributes.item_type !== 'unit' && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700 flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Peso
                  </h4>
                  <div className="space-y-1">
                    {item?.data.attributes.min_weight && item?.data.attributes.max_weight && (
                      <p className="text-gray-600">
                        {item?.data.attributes.min_weight} - {item?.data.attributes.max_weight} {item?.data.attributes.item_type === 'weight_per_g' ? 'g' : 'kg'}
                      </p>
                    )}
                    {item?.data.attributes.measure_interval && (
                      <p className="text-gray-600 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Intervalo: {item?.data.attributes.measure_interval} {item?.data.attributes.item_type === 'weight_per_g' ? 'g' : 'kg'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {item?.data.attributes.extra && item?.data.attributes.extra.data.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionais
                </h4>
                <ul className="grid grid-cols-2 gap-2">
                  {item?.data.attributes.extra.data.map((extra, index) => (
                    <li key={index} className="text-gray-600 bg-gray-50 p-2 rounded-md">
                      {extra.attributes.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item?.data.attributes.prepare_method && item?.data.attributes.prepare_method.data.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <ChefHat className="h-4 w-4" />
                  Métodos de Preparo
                </h4>
                <ul className="grid grid-cols-2 gap-2">
                  {item?.data.attributes.prepare_method.data.map((method, index) => (
                    <li key={index} className="text-gray-600 bg-gray-50 p-2 rounded-md">
                      {method.attributes.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item?.data.attributes.steps && item?.data.attributes.steps.data.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  Passos
                </h4>
                <ol className="space-y-2">
                  {item?.data.attributes.steps.data.map((step, index) => (
                    <li key={index} className="text-gray-600 bg-gray-50 p-2 rounded-md">
                      {step.attributes.name}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}