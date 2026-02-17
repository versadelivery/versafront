"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CatalogItem } from "./types";
import { formatPrice } from "./format-price";
import { Minus, Plus, Utensils, PlusCircle, ShoppingCart, X } from "lucide-react";
import { useCart } from "./cart/cart-context";

interface ProductModalProps {
  product: CatalogItem;
  trigger?: React.ReactNode;
}

export default function ProductModal({ product, trigger }: ProductModalProps) {
  const { addItem } = useCart();

  if (!product) return null;

  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState(product.attributes.min_weight || 1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    product.attributes.steps.data.forEach(step => {
      if (step.attributes.options.data.length > 0) {
        init[step.id] = step.attributes.options.data[0].id;
      }
    });
    return init;
  });

  const { attributes } = product;
  const isWeightBased = attributes.item_type === "weight_per_kg";
  const hasDiscount = !!attributes.price_with_discount &&
    Number(attributes.price_with_discount) < Number(attributes.price);
  const hasExtras = attributes.extra.data.length > 0;
  const hasMethods = attributes.prepare_method.data.length > 0;
  const hasSteps = attributes.steps.data.length > 0;

  const discountPercent = hasDiscount
    ? Math.round(((attributes.price - (attributes.price_with_discount || 0)) / attributes.price) * 100)
    : 0;

  const calculatePrice = () => {
    const basePrice = hasDiscount ? attributes.price_with_discount! : attributes.price;
    let total = isWeightBased ? basePrice * weight : basePrice * quantity;
    selectedExtras.forEach(extraId => {
      const extra = attributes.extra.data.find(e => e.id === extraId);
      if (extra) total += parseFloat(extra.attributes.price);
    });
    return total;
  };

  const resetState = () => {
    setQuantity(1);
    setWeight(product.attributes.min_weight || 1);
    setSelectedExtras([]);
    setSelectedMethods([]);
    setSelectedOptions(() => {
      const init: Record<string, string> = {};
      product.attributes.steps.data.forEach(step => {
        if (step.attributes.options.data.length > 0) {
          init[step.id] = step.attributes.options.data[0].id;
        }
      });
      return init;
    });
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) resetState();
  };

  const handleAddToCart = () => {
    addItem({
      ...product,
      quantity,
      weight: isWeightBased ? weight : undefined,
      selectedExtras,
      selectedMethods,
      selectedOptions,
      totalPrice: calculatePrice(),
    });
    setOpen(false);
    resetState();
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>

      <SheetContent
        side="right"
        className="p-0 w-full sm:max-w-[660px] flex flex-col h-full [&>button:first-of-type]:hidden"
      >
        <SheetTitle className="sr-only">{attributes.name}</SheetTitle>

        {/* Product image + info */}
        <div className="flex-shrink-0">
          {/* Image with close button overlay */}
          <div className="relative w-full aspect-video max-h-[220px] sm:max-h-[260px] bg-gray-100 overflow-hidden">
            {attributes.image_url ? (
              <img
                src={attributes.image_url}
                alt={attributes.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <Utensils className="w-14 h-14 text-gray-200" />
              </div>
            )}

            {/* Close button */}
            <button
              onClick={() => handleOpenChange(false)}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>

            {hasDiscount && (
              <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                -{discountPercent}%
              </div>
            )}
          </div>

          {/* Name + price + description */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-foreground leading-snug">
              {attributes.name}
            </h2>

            <div className="flex items-baseline gap-2 mt-1 flex-wrap">
              <span className={`text-xl font-bold ${hasDiscount ? 'text-primary' : 'text-foreground'}`}>
                {formatPrice(calculatePrice())}
              </span>
              {hasDiscount && (
                <span className="text-muted-foreground text-sm line-through">
                  {formatPrice(attributes.price * (isWeightBased ? weight : quantity))}
                </span>
              )}
              {isWeightBased && (
                <Badge variant="secondary" className="text-xs">
                  {formatPrice(attributes.price)}/kg
                </Badge>
              )}
            </div>

            {attributes.description && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {attributes.description}
              </p>
            )}
          </div>
        </div>

        {/* Options - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-6">

            {/* Quantidade / Peso */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">
                {isWeightBased ? 'Peso (kg)' : 'Quantidade'}
              </p>

              {isWeightBased ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                      onClick={() => setWeight(prev => Math.max(attributes.min_weight || 1, prev - (attributes.measure_interval || 0.5)))}
                      disabled={weight <= (attributes.min_weight || 1)}
                    >
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <div className="flex-1">
                      <Slider
                        value={[weight]}
                        min={attributes.min_weight || 1}
                        max={attributes.max_weight || 10}
                        step={attributes.measure_interval || 0.5}
                        onValueChange={v => setWeight(v[0])}
                      />
                    </div>
                    <button
                      className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                      onClick={() => setWeight(prev => Math.min(attributes.max_weight || 10, prev + (attributes.measure_interval || 0.5)))}
                      disabled={weight >= (attributes.max_weight || 10)}
                    >
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>{attributes.min_weight || 1}kg</span>
                    <span className="font-semibold text-foreground">{weight}kg selecionado</span>
                    <span>{attributes.max_weight || 10}kg</span>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center rounded-full border border-gray-200 overflow-hidden bg-gray-50/50">
                  <button
                    className="h-9 w-9 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                  <button
                    className="h-9 w-9 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    onClick={() => setQuantity(prev => prev + 1)}
                  >
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>

            {/* Adicionais */}
            {hasExtras && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <PlusCircle className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">Adicionais</p>
                    <span className="ml-auto text-xs text-muted-foreground">Opcional</span>
                  </div>
                  <div className="space-y-2">
                    {attributes.extra.data.map(extra => (
                      <label
                        key={extra.id}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedExtras.includes(extra.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-100 hover:border-gray-200 bg-gray-50/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`extra-${extra.id}`}
                            checked={selectedExtras.includes(extra.id)}
                            onCheckedChange={() =>
                              setSelectedExtras(prev =>
                                prev.includes(extra.id)
                                  ? prev.filter(id => id !== extra.id)
                                  : [...prev, extra.id]
                              )
                            }
                            className="h-4 w-4 rounded"
                          />
                          <span className="text-sm font-medium">{extra.attributes.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          +{formatPrice(parseFloat(extra.attributes.price))}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Modo de Preparo */}
            {hasMethods && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">Modo de Preparo</p>
                    <span className="ml-auto text-xs text-muted-foreground">Opcional</span>
                  </div>
                  <div className="space-y-2">
                    {attributes.prepare_method.data.map(method => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedMethods.includes(method.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-100 hover:border-gray-200 bg-gray-50/40'
                        }`}
                      >
                        <Checkbox
                          id={`method-${method.id}`}
                          checked={selectedMethods.includes(method.id)}
                          onCheckedChange={() =>
                            setSelectedMethods(prev =>
                              prev.includes(method.id)
                                ? prev.filter(id => id !== method.id)
                                : [...prev, method.id]
                            )
                          }
                          className="h-4 w-4 rounded"
                        />
                        <span className="text-sm font-medium">{method.attributes.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Etapas / Opções */}
            {hasSteps && (
              <>
                <Separator />
                <div className="space-y-5">
                  {attributes.steps.data.map(step => (
                    <div key={step.id}>
                      <p className="text-sm font-semibold text-foreground mb-2.5">
                        {step.attributes.name}
                      </p>
                      <RadioGroup
                        value={selectedOptions[step.id]}
                        onValueChange={v =>
                          setSelectedOptions(prev => ({ ...prev, [step.id]: v }))
                        }
                        className="space-y-2"
                      >
                        {step.attributes.options.data.map(option => (
                          <label
                            key={option.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedOptions[step.id] === option.id
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-100 hover:border-gray-200 bg-gray-50/40'
                            }`}
                          >
                            <RadioGroupItem
                              value={option.id}
                              id={`option-${step.id}-${option.id}`}
                              className="h-4 w-4"
                            />
                            <span className="text-sm font-medium">{option.attributes.name}</span>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>

        {/* Footer - sticky add to cart */}
        <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4 bg-white">
          <Button
            className="w-full h-12 text-sm font-semibold rounded-xl gap-2"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
            Adicionar ao carrinho · {formatPrice(calculatePrice())}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
