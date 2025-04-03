import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { ProductCard } from "./product-card";
import { UICatalogGroup } from "@/app/types/catalog";

interface ProductGroupProps {
  group: UICatalogGroup;
  onEdit: (group: UICatalogGroup) => void;
}

export function ProductGroup({ group, onEdit }: ProductGroupProps) {
  return (
    <div className="bg-white rounded-xs shadow-sm p-4 sm:p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEdit(group)}
            className="text-gray-500 hover:text-primary self-center"
          >
            <Edit2 className="w-5 h-5" />
          </Button>
          {group.image &&(
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative rounded-xs overflow-hidden">
              <Image
                src={group.image}
                alt={group.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold">{group.name}</h2>
            <p className="text-sm sm:text-base text-foreground">{group.description}</p>
            <p className="text-sm sm:text-base text-foreground/40">Prioridade: {group.priority}</p>
          </div>
        </div>
      </div>
      
      {group?.products && group.products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {group.products.map(product => (
            <ProductCard
              key={product.data.id}
              product={product.data} 
              groupName={group.name} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          Nenhum produto cadastrado neste grupo
        </div>
      )}
    </div>
  );
}