import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { Product } from "@/app/types/admin";

interface ProductCardProps {
  product: Product;
  groupName: string;
}

export function ProductCard({ product, groupName }: ProductCardProps) {
  return (
    <div className="overflow-hidden bg-[#212121]/10 rounded-xs shadow-none hover:shadow-md transition-shadow">
      <div className="relative w-full aspect-square lg:h-48 bg-gray-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
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
        >
          <Edit2 className="w-3 h-3 lg:w-4 lg:h-4" />
        </Button>
      </div>
      <div className="p-3 lg:p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-sm font-semibold lg:text-base line-clamp-1">{product.name}</h3>
            <p className="text-xs text-gray-500 lg:text-sm line-clamp-2">{product.description}</p>
          </div>
          <div className="flex flex-col items-end">
            {product.price_with_discount !== undefined && product.price_with_discount < product.price ? (
              <>
                <span className="text-sm font-semibold text-gray-400 line-through">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-sm font-semibold text-primary lg:text-base">
                  R$ {product.price_with_discount.toFixed(2).replace('.', ',')}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold lg:text-base">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 lg:text-sm">{groupName}</span>
          {product.item_type === 'weight' && (
            <span className="text-xs text-gray-500 lg:text-sm">
              {product.min_weight}g - {product.max_weight}g ({product.measure_interval}g)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}