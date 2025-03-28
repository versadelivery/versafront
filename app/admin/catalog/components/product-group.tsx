import type { ProductGroup } from "@/app/types/admin";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { ProductCard } from "./product-card";

interface ProductGroupProps {
  group: ProductGroup;
  onEdit: (group: ProductGroup) => void;
}

export function ProductGroup({ group, onEdit }: ProductGroupProps) {
  return (
    <div className="bg-white rounded-xs shadow-sm p-4 sm:p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          {group.image && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative rounded-xs overflow-hidden">
              <Image
                src={group.image}
                alt={group.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{group.name}</h2>
            <p className="text-sm sm:text-base text-gray-600">{group.description}</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onEdit(group)}
          className="text-gray-500 hover:text-primary"
        >
          <Edit2 className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {group.products.map(product => (
          <ProductCard key={product.id} product={product} groupName={group.name} />
        ))}
      </div>
    </div>
  );
}