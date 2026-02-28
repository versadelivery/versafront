"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CatalogItem } from "./types";
import { formatPrice } from "./format-price";
import { Minus, Plus, Utensils, PlusCircle, ShoppingCart, X, Info } from "lucide-react";
import { useCart } from "./cart/cart-context";

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = 2;

function WeightPicker({ min, max, step, value, onChange }: {
  min: number; max: number; step: number; value: number; onChange: (v: number) => void;
}) {
  const precision = (step.toString().split('.')[1] ?? '').length;

  const options: number[] = [];
  for (let i = 0; ; i++) {
    const v = parseFloat((min + i * step).toFixed(precision));
    if (v > max) break;
    options.push(v);
  }

  const fmt = (v: number) => {
    if (v < 1) return `${Math.round(v * 1000)}g`;
    const str = v.toFixed(precision).replace(/\.?0+$/, '');
    return `${str} kg`;
  };

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const idx = options.findIndex(o => Math.abs(o - value) < step * 0.01);
    if (listRef.current && idx >= 0) {
      listRef.current.scrollTop = idx * ITEM_H;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (!listRef.current) return;
    const idx = Math.round(listRef.current.scrollTop / ITEM_H);
    const v = options[Math.max(0, Math.min(options.length - 1, idx))];
    if (v !== undefined && Math.abs(v - value) > step * 0.001) onChange(v);
  };

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-2xl border border-gray-100"
      style={{ height: ITEM_H * VISIBLE, maxWidth: 240 }}
    >
      {/* Fade top */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{ height: ITEM_H * PAD, background: 'linear-gradient(to bottom, white 40%, transparent)' }}
      />
      {/* Fade bottom */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: ITEM_H * PAD, background: 'linear-gradient(to top, white 40%, transparent)' }}
      />
      {/* Highlight row */}
      <div
        className="absolute inset-x-0 z-0 pointer-events-none bg-gray-50"
        style={{ top: ITEM_H * PAD, height: ITEM_H, borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}
      />
      {/* Scroll list */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="relative z-0 h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
      >
        <div aria-hidden style={{ height: ITEM_H * PAD }} />
        {options.map((v) => {
          const selected = Math.abs(v - value) < step * 0.001;
          return (
            <div
              key={v}
              style={{ height: ITEM_H, scrollSnapAlign: 'center' }}
              className={`flex items-center justify-center cursor-pointer transition-all duration-150 ${
                selected
                  ? 'text-base font-bold text-foreground'
                  : 'text-sm font-normal text-muted-foreground'
              }`}
              onClick={() => {
                const idx = options.indexOf(v);
                listRef.current?.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
                onChange(v);
              }}
            >
              {fmt(v)}
            </div>
          );
        })}
        <div aria-hidden style={{ height: ITEM_H * PAD }} />
      </div>
    </div>
  );
}

interface ProductModalProps {
  product: CatalogItem;
  trigger?: React.ReactNode;
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

export default function ProductModal({ product, trigger, externalOpen, onExternalOpenChange }: ProductModalProps) {
  const { addItem } = useCart();

  if (!product) return null;

  const isControlled = externalOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? (v: boolean) => onExternalOpenChange?.(v) : setInternalOpen;
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
  const [selectedSharedComplements, setSelectedSharedComplements] = useState<string[]>([]);


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

  const calculatedPrice = useMemo(() => {
    const basePrice = hasDiscount ? attributes.price_with_discount! : attributes.price;
    let total = isWeightBased ? basePrice * weight : basePrice * quantity;

    // Extras
    selectedExtras.forEach(extraId => {
      const extra = attributes.extra.data.find(e => e.id === extraId);
      if (extra) total += parseFloat(extra.attributes.price);
    });

    // Shared Complements
    selectedSharedComplements.forEach(optionId => {
      attributes.shared_complements?.data.forEach(group => {
        const option = group.attributes.options.find(o => o.id.toString() === optionId.toString());
        if (option) total += Number(option.price);
      });
    });

    return total;
  }, [hasDiscount, attributes, isWeightBased, weight, quantity, selectedExtras, selectedSharedComplements]);

  const resetState = () => {
    setQuantity(1);
    setWeight(product.attributes.min_weight || 1);
    setSelectedExtras([]);
    setSelectedMethods([]);
    setSelectedSharedComplements([]);
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
      selectedSharedComplements,
      totalPrice: calculatedPrice,
    });
    setOpen(false);
    resetState();
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {trigger && (
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
      )}

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
                {formatPrice(calculatedPrice)}
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
                {isWeightBased ? 'Você gostaria de quanto?' : 'Quantidade'}
              </p>

              {isWeightBased ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Produtos por kg podem variar na pesagem.
                  </p>
                  <WeightPicker
                    min={attributes.min_weight || 0.1}
                    max={attributes.max_weight || 10}
                    step={attributes.measure_interval || 0.1}
                    value={weight}
                    onChange={setWeight}
                  />
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

            {/* Complementos Compartilhados */}
            {attributes.shared_complements?.data?.length > 0 && (
              <>
                <Separator />
                <div className="space-y-6">
                  {attributes.shared_complements.data.map(group => (
                    <div key={group.id}>
                      <div className="flex items-center gap-2 mb-3">
                        <PlusCircle className="w-4 h-4 text-primary" />
                        <p className="text-sm font-semibold text-foreground">{group.attributes.name}</p>
                        <span className="ml-auto text-xs text-muted-foreground">Opcional</span>
                      </div>
                      <div className="space-y-2">
                        {group.attributes.options.map(option => (
                          <label
                            key={option.id}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedSharedComplements.includes(option.id.toString())
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-100 hover:border-gray-200 bg-gray-50/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={`shared-${option.id}`}
                                checked={selectedSharedComplements.includes(option.id.toString())}
                                onCheckedChange={() =>
                                  setSelectedSharedComplements(prev =>
                                    prev.includes(option.id.toString())
                                      ? prev.filter(id => id !== option.id.toString())
                                      : [...prev, option.id.toString()]
                                  )
                                }
                                className="h-4 w-4 rounded"
                              />
                              <span className="text-sm font-medium">{option.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-primary">
                              +{formatPrice(Number(option.price))}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
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
            Adicionar ao carrinho · {formatPrice(calculatedPrice)}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
