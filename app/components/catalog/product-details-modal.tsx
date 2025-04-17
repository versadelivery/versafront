import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Edit2, Info, DollarSign, Tag, Scale, Clock, Plus, Minus, Check } from "lucide-react";
import { UICatalogItem } from "@/app/types/catalog";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: UICatalogItem;
  onEdit: (product: UICatalogItem) => void;
}

export function ProductDetailsModal({ isOpen, onOpenChange, product, onEdit }: ProductDetailsModalProps) {
  const hasDiscount = !!product.attributes.price_with_discount;
  const hasExtras = product.attributes.extra.data.length > 0;
  const hasPrepareMethods = product.attributes.prepare_method.data.length > 0;
  const hasSteps = product.attributes.steps.data.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="font-outfit max-w-2xl w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] bg-background max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader className="top-0 z-10">
          <DialogTitle className="font-outfit text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <Info className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            DETALHES DO PRODUTO
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {product.attributes.image_url && (
            <div className="relative w-full h-32 sm:h-40 md:h-48 rounded-lg overflow-hidden border border-border">
              <img 
                src={product.attributes.image_url} 
                alt={product.attributes.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-outfit text-base sm:text-lg font-semibold flex items-center gap-2">
                <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Informações Básicas
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(product)}
                className="text-muted-foreground hover:text-primary"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="font-outfit text-sm text-muted-foreground">Nome</p>
                <p className="font-outfit font-medium text-base">{product.attributes.name}</p>
              </div>
              <div className="space-y-1.5">
                <p className="font-outfit text-sm text-muted-foreground">Descrição</p>
                <p className="font-outfit font-medium text-base">{product.attributes.description || "Sem descrição"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-outfit text-base sm:text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Preços
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="font-outfit text-sm text-muted-foreground">Preço Base</p>
                <p className="font-outfit font-medium text-base">R$ {parseFloat(product.attributes.price).toFixed(2)}</p>
              </div>
              {hasDiscount && (
                <div className="space-y-1.5">
                  <p className="font-outfit text-sm text-muted-foreground">Preço com Desconto</p>
                  <p className="font-outfit font-medium text-base text-primary">R$ {parseFloat(product.attributes.price_with_discount || "0").toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {product.attributes.item_type === "weight" && (
            <div className="space-y-4">
              <h3 className="font-outfit text-base sm:text-lg font-semibold flex items-center gap-2">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Medidas
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <p className="font-outfit text-sm text-muted-foreground">Unidade</p>
                  <p className="font-outfit font-medium text-base">{product.attributes.unit_of_measurement}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="font-outfit text-sm text-muted-foreground">Peso Mínimo</p>
                  <p className="font-outfit font-medium text-base">{product.attributes.min_weight} {product.attributes.unit_of_measurement}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="font-outfit text-sm text-muted-foreground">Peso Máximo</p>
                  <p className="font-outfit font-medium text-base">{product.attributes.max_weight} {product.attributes.unit_of_measurement}</p>
                </div>
              </div>
            </div>
          )}

          {hasExtras && (
            <div className="space-y-4">
              <h3 className="font-outfit text-base sm:text-lg font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Adicionais
              </h3>

              <div className="space-y-2">
                {product.attributes.extra.data.map((extra) => (
                  <div key={extra.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-outfit font-medium text-base">{extra.attributes.name}</span>
                    <span className="font-outfit text-primary text-base">+ R$ {parseFloat(extra.attributes.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasPrepareMethods && (
            <div className="space-y-4">
              <h3 className="font-outfit text-base sm:text-lg font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Modos de Preparo
              </h3>

              <div className="space-y-2">
                {product.attributes.prepare_method.data.map((method) => (
                  <div key={method.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    <span className="font-outfit text-base">{method.attributes.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasSteps && (
            <div className="space-y-4">
              <h3 className="font-outfit text-base sm:text-lg font-semibold flex items-center gap-2">
                <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Etapas
              </h3>

              <div className="space-y-4">
                {product.attributes.steps.data.map((step) => (
                  <div key={step.id} className="space-y-2">
                    <div className="font-outfit font-medium text-primary text-base">{step.attributes.name}</div>
                    <div className="space-y-1.5 pl-4">
                      {step.attributes.options.data.map((option) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-muted-foreground" />
                          <span className="font-outfit text-base">{option.attributes.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 