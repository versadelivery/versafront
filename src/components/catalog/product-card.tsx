import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit2, Info, Package, Scale, Tag } from "lucide-react";
import { UICatalogItem } from "@/types/catalog";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { ProductDetailsModal } from "./product-details-modal";

interface ProductCardProps {
  product: UICatalogItem;
  groupName: string;
  onEdit: (product: UICatalogItem) => void;
}

export function ProductCard({ product, groupName, onEdit }: ProductCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  if (!product || !product.attributes) {
    return (
      <div className="overflow-hidden bg-background rounded-lg shadow-sm p-4">
        <p className="text-destructive font-outfit">Erro ao carregar produto</p>
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
    min: attributes.min_weight || 0,
    max: attributes.max_weight || 0,
    interval: attributes.measure_interval || 0,
    unit: attributes.unit_of_measurement || 'g'
  } : null;

  return (
    <>
      <div 
        className="bg-background rounded-lg shadow-sm p-4 border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-md"
        onClick={() => setIsDetailsModalOpen(true)}
      >
        <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden group">
          {isImageLoading && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          {attributes.image_url ? (
            <Image
              src={attributes.image_url}
              alt={attributes.name || "Produto"}
              fill
              className={cn(
                "object-cover transition-all duration-300 group-hover:scale-105",
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
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="absolute top-2 right-2 bg-background/80 hover:bg-background backdrop-blur-sm"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="p-3 space-y-3">
          <div className="space-y-1.5">
            <h3 className="font-outfit font-semibold text-base leading-tight break-words">{attributes.name || "Sem nome"}</h3>
            {attributes.description && (
              <p className="font-outfit text-sm text-muted-foreground line-clamp-2">{attributes.description}</p>
            )}
          </div>

          <div className="space-y-2">
            {hasDiscount ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-outfit text-muted-foreground">Preço original</span>
                  <span className="font-outfit line-through text-muted-foreground">
                    R$ {originalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-outfit text-sm font-medium">Preço com desconto</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-outfit text-sm font-semibold text-primary">
                      R$ {discountPrice.toFixed(2)}
                    </span>
                    <span className="font-outfit text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      -{discountPercentage}%
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-outfit text-sm text-muted-foreground">Preço</span>
                <span className="font-outfit text-sm font-semibold">
                  R$ {originalPrice.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span className="font-outfit">Prioridade: {attributes.priority || "0"}</span>
            </div>
            {isWeightType && weightInfo && (
              <div className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span className="font-outfit">
                  {weightInfo.min}{weightInfo.unit} - {weightInfo.max}{weightInfo.unit}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        product={product}
        onEdit={onEdit}
      />
    </>
  );
}