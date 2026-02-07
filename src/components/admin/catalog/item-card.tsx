import { Edit, Package, Scale, Plus, ChefHat, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { ItemDetailsModal } from "./item-details-modal";
import { EditItemModal } from "./edit-item-modal";
import { fixImageUrl } from "@/utils/image-url";

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

  // Helper to extract name from various possible data structures
  const getName = (obj: any) => {
    if (!obj) return null;
    // JSONAPI structure: { attributes: { name: '...' } }
    if (obj.attributes) {
      return obj.attributes.name || obj.attributes.description || null;
    }
    // Raw structure: { name: '...' }
    return obj.name || obj.description || null;
  };
  
  return (
    <>
      <div 
        className="group bg-white rounded-3xl shadow-sm border border-border/60 overflow-hidden min-w-64 w-full h-full relative cursor-pointer hover:shadow-2xl hover:border-primary/30 transition-all duration-500 flex flex-col"
        onClick={handleOpenDetails}
      >
        {/* Top Badges & Actions */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 bg-white/95 hover:bg-white backdrop-blur-md shadow-lg rounded-full border border-black/5"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
          >
            <Edit className="h-4.5 w-4.5 text-gray-800" />
          </Button>
        </div>

        {item.price_with_discount && item.price > 0 && (
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-primary text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-lg uppercase tracking-wider">
              {Math.round(((item.price - item.price_with_discount) / item.price * 100))}% OFF
            </div>
          </div>
        )}

        {/* Image / Placeholder Container */}
        <div className="relative h-56 w-full bg-muted/20 overflow-hidden flex-shrink-0">
          {item.image ? (
            <Image
              src={fixImageUrl(item.image) || ''}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <Package className="h-20 w-20 text-muted-foreground/15" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content Area */}
        <div className="p-7 flex flex-col flex-1 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-2 line-clamp-2 leading-tight">
              {item.name}
            </h3>
            {item.description ? (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                {item.description}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground/30 italic font-medium">Nenhuma descrição disponível</p>
            )}
          </div>
          
          <div className="pt-5 border-t border-gray-100/80">
            <div className="flex justify-between items-end gap-4">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900 leading-none tracking-tight">
                  R$ {item.price_with_discount ? item.price_with_discount?.toFixed(2).replace('.', ',') : item.price.toFixed(2).replace('.', ',')}
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-bold ml-1.5 uppercase opacity-60">
                    {item.item_type === 'weight_per_g' ? 'por g' : item.item_type === 'weight_per_kg' ? 'por kg' : ''}
                  </span>
                </span>
                {item.price_with_discount && (
                  <span className="text-xs sm:text-sm text-muted-foreground font-semibold line-through decoration-muted-foreground/40 mt-1.5">
                    R$ {item.price.toFixed(2).replace('.', ',')} 
                  </span>
                )}
              </div>
              
              {item.item_type !== 'unit' && (
                <div className="flex items-center gap-2 text-[10px] sm:text-xs bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl font-bold text-gray-600 shadow-sm whitespace-nowrap">
                  <Scale className="h-3.5 w-3.5" />
                  {item.min_weight && item.max_weight ? (
                    `${item.min_weight}-${item.max_weight}${item.item_type === 'weight_per_g' ? 'g' : 'kg'}`
                  ) : (
                    item.item_type === 'weight_per_g' ? 'g' : 'kg'
                  )}
                </div>
              )} 
            </div>
          </div>

          <div className="space-y-6 pt-2">
            {item.catalog_item_extras_attributes && item.catalog_item_extras_attributes.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-black text-gray-800 flex items-center gap-2.5 uppercase tracking-widest opacity-80">
                  <Plus className="h-4.5 w-4.5 text-primary" />
                  Adicionais
                </h4>
                <ul className="text-xs sm:text-sm text-muted-foreground pl-7 list-disc space-y-1.5 font-medium">
                  {item.catalog_item_extras_attributes.map((extra, index) => {
                    const name = getName(extra);
                    return name ? <li key={index} className="leading-relaxed">{name}</li> : null;
                  })}
                </ul>
              </div>
            )}

            {item.catalog_item_prepare_methods_attributes && item.catalog_item_prepare_methods_attributes.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-black text-gray-800 flex items-center gap-2.5 uppercase tracking-widest opacity-80">
                  <ChefHat className="h-4.5 w-4.5 text-primary" />
                  Métodos de Preparo
                </h4>
                <ul className="text-xs sm:text-sm text-muted-foreground pl-7 list-disc space-y-1.5 font-medium">
                  {item.catalog_item_prepare_methods_attributes.map((method, index) => {
                    const name = getName(method);
                    return name ? <li key={index} className="leading-relaxed">{name}</li> : null;
                  })}
                </ul>
              </div>
            )}

            {item.catalog_item_steps_attributes && item.catalog_item_steps_attributes.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-black text-gray-800 flex items-center gap-2.5 uppercase tracking-widest opacity-80">
                  <ListChecks className="h-4.5 w-4.5 text-primary" />
                  Passos
                </h4>
                <ul className="text-xs sm:text-sm text-muted-foreground pl-7 list-disc space-y-1.5 font-medium">
                  {item.catalog_item_steps_attributes.map((step, index) => {
                    const name = getName(step);
                    return name ? <li key={index} className="leading-relaxed">{name}</li> : null;
                  })}
                </ul>
              </div>
            )}
          </div>
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