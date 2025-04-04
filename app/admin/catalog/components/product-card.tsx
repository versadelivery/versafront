import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit2, Info, Package, Scale, Tag } from "lucide-react";
import { UICatalogItem } from "@/app/types/catalog";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface ProductCardProps {
  product: UICatalogItem;
  groupName: string;
  onEdit?: (item: UICatalogItem) => void;
}

export function ProductCard({ product, groupName, onEdit }: ProductCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  if (!product || !product.attributes) {
    return (
      <div className="overflow-hidden bg-[#212121]/10 rounded-xs shadow-none p-4">
        <p className="text-red-500">Erro ao carregar produto</p>
      </div>
    );
  }
  
  const { attributes } = product;
  const hasDiscount = !!attributes.price_with_discount;
  const originalPrice = parseFloat(attributes.price || "0");
  const discountPrice = hasDiscount ? parseFloat(attributes.price_with_discount || "0") : 0;
  const discountPercentage = hasDiscount && originalPrice > 0 
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) 
    : 0;

  const isWeightType = attributes.item_type === 'weight';
  const weightInfo = isWeightType ? {
    min: parseFloat(attributes.min_weight || "0"),
    max: parseFloat(attributes.max_weight || "0"),
    interval: parseFloat(attributes.measure_interval || "0"),
    unit: attributes.unit_of_measurement || 'g'
  } : null;

  return (
    <div className="overflow-hidden bg-white rounded-xs shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-full aspect-square lg:h-48 bg-muted/50 hover:scale-105 duration-300">
        {isImageLoading && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        {attributes.image_url ? (
          <Image
            src={attributes.image_url}
            alt={attributes.name || "Produto"}
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              isImageLoading ? "opacity-0" : "opacity-100"
            )}
            onLoadingComplete={() => setIsImageLoading(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Package className="w-8 h-8" />
          </div>
        )}
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(product)}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="p-3 space-y-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm leading-tight">{attributes.name || "Sem nome"}</h3>
          {attributes.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{attributes.description}</p>
          )}
        </div>

        <div className="space-y-1.5">
          {hasDiscount ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Preço original</span>
                <span className="line-through text-muted-foreground">
                  R$ {originalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Preço com desconto</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-primary">
                    R$ {discountPrice.toFixed(2)}
                  </span>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    -{discountPercentage}%
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Preço</span>
              <span className="text-sm font-medium">
                R$ {originalPrice.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>Prioridade: {attributes.priority || "0"}</span>
          </div>
          {isWeightType && weightInfo && (
            <div className="flex items-center gap-1">
              <Scale className="w-3 h-3" />
              <span>
                {weightInfo.min}{weightInfo.unit} - {weightInfo.max}{weightInfo.unit}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}