import { Edit, Info, Package, Scale, Clock, Plus, ChefHat, ListChecks } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { ItemDetailsModal } from "./item-details-modal";
import { EditItemModal } from "./edit-item-modal";

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
    catalog_item_extras_attributes?: any[];
    catalog_item_prepare_methods_attributes?: any[];
    catalog_item_steps_attributes?: any[];
  };
}

export function ItemCard({ item }: ItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleOpenDetails = () => {
    setIsDetailsModalOpen(true);
  }

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
  }

  const handleEdit = () => {
    setIsEditing(true);
  }
  
  return (
    <>
      <div 
        className="bg-white rounded-xs shadow-md overflow-hidden min-w-64 w-full max-w-sm relative cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleOpenDetails}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit();
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>

        {item.price_with_discount && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full z-10 bg-primary text-primary-foreground">
            <span className="text-sm font-semibold">
              - {((item.price - item.price_with_discount) / item.price * 100).toFixed(2)}%
            </span>
          </div>
        )}

        {item.image && (
          <div className="relative h-48 w-full">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-4 space-y-4">
          <div className="max-w-xs overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Package className="h-4 w-4 flex-shrink-0" />
              <span className="whitespace-normal break-all">{item.name}</span>
            </h3>
            {item.description && (
              <p className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="break-words whitespace-normal">
                  {item.description}
                </span>
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">
                R$ {item.price_with_discount ? item.price_with_discount.toFixed(2).replace('.', ',') : item.price.toFixed(2).replace('.', ',')}
                <span className="text-xs text-gray-500 ml-1">
                  {item.item_type === 'weight_per_g' ? 'por g' : item.item_type === 'weight_per_kg' ? 'por kg' : ''}
                </span>
              </span>
              {item.price_with_discount && (
                <span className="text-sm text-gray-500 line-through">
                  R$ {item.price.toFixed(2).replace('.', ',')} 
                  <span className="text-xs text-gray-500 ml-1">
                    {item.item_type === 'weight_per_g' ? 'por g' : item.item_type === 'weight_per_kg' ? 'por kg' : ''}
                  </span>
                </span>
              )}
            </div>
            
            {item.item_type !== 'unit' && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Scale className="h-4 w-4" />
                {item.min_weight && item.max_weight ? (
                  `${item.min_weight} - ${item.max_weight} ${item.item_type === 'weight_per_g' ? 'g' : 'kg'}`
                ) : (
                  item.item_type === 'weight_per_g' ? 'g' : 'kg'
                )}
                {item.measure_interval && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Intervalo: {item.measure_interval} {item.item_type === 'weight_per_g' ? 'g' : 'kg'}
                  </span>
                )}
              </div>
            )} 
          </div>

          {item.catalog_item_extras_attributes && item.catalog_item_extras_attributes.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionais
              </h4>
              <ul className="text-sm text-gray-600 pl-6">
                {item.catalog_item_extras_attributes.map((extra, index) => (
                  <li key={index}>{extra.name}</li>
                ))}
              </ul>
            </div>
          )}

          {item.catalog_item_prepare_methods_attributes && item.catalog_item_prepare_methods_attributes.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                Métodos de Preparo
              </h4>
              <ul className="text-sm text-gray-600 pl-6">
                {item.catalog_item_prepare_methods_attributes.map((method, index) => (
                  <li key={index}>{method.name}</li>
                ))}
              </ul>
            </div>
          )}

          {item.catalog_item_steps_attributes && item.catalog_item_steps_attributes.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Passos
              </h4>
              <ul className="text-sm text-gray-600 pl-6">
                {item.catalog_item_steps_attributes.map((step, index) => (
                  <li key={index}>{step.description}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ItemDetailsModal 
        id={item.id}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
      />
      <EditItemModal 
        id={item.id.toString()}
        isOpen={isEditing}
        onOpenChange={setIsEditing}
      />
    </>
  );
} 