import { Product } from "@/app/types/admin";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  groupName: string;
}

export function ProductCard({ product, groupName }: ProductCardProps) {
  return (
    <div className="overflow-hidden bg-[#212121]/10 rounded-xs shadow-none">
      <div className="relative w-full aspect-square lg:h-48">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
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
            <h3 className="text-sm font-semibold lg:text-base">{product.name}</h3>
            <p className="text-xs text-gray-500 lg:text-sm">{product.unit}</p>
          </div>
          <span className="text-sm font-semibold lg:text-base">R$ {product.price.toFixed(2).replace('.', ',')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 lg:text-sm">{groupName}</span>
          <span className={`text-xs lg:text-sm ${product.active ? 'text-primary' : 'text-gray-500'}`}>
            {product.active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>
    </div>
  );
}