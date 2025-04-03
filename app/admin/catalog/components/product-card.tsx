import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { Product } from "@/app/types/catalog";

interface ProductCardProps {
  product: Product;
  groupName: string;
  onEdit?: (product: Product) => void;
}

export function ProductCard({ product, groupName, onEdit }: ProductCardProps) {
  // @ts-ignore
  const { attributes } = product;
  
  const formatCurrency = (value: string) => {
    return parseFloat(value).toFixed(2).replace('.', ',');
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(product);
    }
  };

  return (
    <div className="overflow-hidden bg-[#212121]/10 rounded-xs shadow-none hover:shadow-md transition-shadow">
      <div className="relative w-full aspect-square lg:h-48 bg-gray-100">
        {attributes.image_url ? (
          <Image
            src={attributes.image_url}
            alt={attributes.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Sem imagem
          </div>
        )}
        <Button 
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white w-8 h-8 lg:w-10 lg:h-10"
          onClick={handleEditClick}
        >
          <Edit2 className="w-3 h-3 lg:w-4 lg:h-4" />
        </Button>
      </div>
      <div className="p-3 lg:p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-sm font-semibold lg:text-base line-clamp-1">{attributes.name}</h3>
            <p className="text-xs text-gray-500 lg:text-sm line-clamp-2">{attributes.description}</p>
          </div>
          <div className="flex flex-col items-end">
            {attributes.price_with_discount && 
            parseFloat(attributes.price_with_discount) < parseFloat(attributes.price) ? (
              <>
                <span className="text-sm font-semibold text-gray-400 line-through">
                  R$ {formatCurrency(attributes.price)}
                </span>
                <span className="text-sm font-semibold text-primary lg:text-base">
                  R$ {formatCurrency(attributes.price_with_discount)}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold lg:text-base">
                R$ {formatCurrency(attributes.price)}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 lg:text-sm">{groupName}</span>
          {attributes.item_type === 'weight' && (
            <span className="text-xs text-gray-500 lg:text-sm">
              {attributes.min_weight}g - {attributes.max_weight}g ({attributes.measure_interval}g)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}