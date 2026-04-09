"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { CatalogItem } from "./types";
import { formatPrice } from "./format-price";
import { Minus, Plus, Utensils, X, Info } from "lucide-react";
import { useCart } from "./cart/cart-context";

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = 2;

function WeightPicker({ min, max, step, value, onChange, unit = 'kg' }: {
  min: number; max: number; step: number; value: number; onChange: (v: number) => void; unit?: 'kg' | 'g';
}) {
  const precision = Math.max((step.toString().split('.')[1] ?? '').length, (min.toString().split('.')[1] ?? '').length);

  const options: number[] = [];
  for (let i = 0; ; i++) {
    const v = parseFloat((min + i * step).toFixed(precision));
    if (v > max) break;
    options.push(v);
  }
  if (options.length === 0 || options[options.length - 1] < max) {
    options.push(max);
  }

  const fmt = (v: number) => {
    if (unit === 'g') return `${Math.round(v)} g`;
    if (v < 1) return `${Math.round(v * 1000)} g`;
    const str = precision > 0
      ? v.toFixed(precision).replace(/(\.\d*[1-9])0+$/, '$1').replace(/\.0+$/, '')
      : String(Math.round(v));
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
      className="relative mx-auto overflow-hidden rounded-md border border-[#E5E2DD]"
      style={{ height: ITEM_H * VISIBLE, maxWidth: 240 }}
    >
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{ height: ITEM_H * PAD, background: 'linear-gradient(to bottom, white 40%, transparent)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: ITEM_H * PAD, background: 'linear-gradient(to top, white 40%, transparent)' }}
      />
      <div
        className="absolute inset-x-0 z-0 pointer-events-none bg-gray-50"
        style={{ top: ITEM_H * PAD, height: ITEM_H, borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}
      />
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

/* ── DoorDash-style custom checkbox ── */
function DDCheckbox({ checked }: { checked: boolean }) {
  return (
    <div
      className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
        checked
          ? 'bg-foreground border-foreground'
          : 'border-gray-300 bg-white'
      }`}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

/* ── DoorDash-style custom radio ── */
function DDRadio({ checked }: { checked: boolean }) {
  return (
    <div
      className={`w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
        checked
          ? 'border-foreground'
          : 'border-gray-300'
      }`}
    >
      {checked && <div className="w-2.5 h-2.5 rounded-full bg-foreground" />}
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
  const [weight, setWeight] = useState(product.attributes.min_weight || (product.attributes.item_type === 'weight_per_g' ? 100 : 1));
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
  const isUnavailable = !!attributes.has_out_of_stock_ingredient;
  const isWeightBased = attributes.item_type === "weight_per_kg" || attributes.item_type === "weight_per_g";
  const isGrams = attributes.item_type === "weight_per_g";
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

    selectedExtras.forEach(extraId => {
      const extra = attributes.extra.data.find(e => e.id === extraId);
      if (extra) {
        const extraPrice = parseFloat(extra.attributes.price);
        if (!isNaN(extraPrice)) total += extraPrice;
      }
    });

    selectedSharedComplements.forEach(optionId => {
      attributes.shared_complements?.data?.forEach(group => {
        const option = group.attributes.options.find(o => o.id.toString() === optionId.toString());
        if (option) {
          const price = Number(option.price);
          if (!isNaN(price)) total += price;
        }
      });
    });

    return total;
  }, [hasDiscount, attributes, isWeightBased, weight, quantity, selectedExtras, selectedSharedComplements]);

  const resetState = () => {
    setQuantity(1);
    setWeight(product.attributes.min_weight || (product.attributes.item_type === 'weight_per_g' ? 100 : 1));
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
      cartId: crypto.randomUUID(),
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
        className="p-0 w-full sm:max-w-[520px] flex flex-col h-full [&>button:first-of-type]:hidden bg-white"
      >
        <SheetTitle className="sr-only">{attributes.name}</SheetTitle>

        {/* ── Scrollable area (image + info + options) ── */}
        <div className="flex-1 overflow-y-auto">

          {isUnavailable && (
            <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive font-medium">
                Este item está temporariamente indisponível devido a um ingrediente em falta.
              </p>
            </div>
          )}

          {/* Hero image */}
          <div className="relative w-full aspect-[4/3] bg-gray-100">
            {attributes.image_url ? (
              <img
                src={attributes.image_url}
                alt={attributes.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <Utensils className="w-16 h-16 text-gray-200" />
              </div>
            )}

            {/* Close button - DoorDash style */}
            <button
              onClick={() => handleOpenChange(false)}
              className="absolute top-4 left-4 h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors z-10"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            {hasDiscount && (
              <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                -{discountPercent}%
              </div>
            )}
          </div>

          {/* Item info */}
          <div className="px-5 pt-5 pb-4">
            <h2 className="font-tomato text-[22px] font-bold text-gray-900 leading-tight">
              {attributes.name}
            </h2>

            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-base font-medium text-gray-900">
                {formatPrice(hasDiscount ? attributes.price_with_discount! : attributes.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(attributes.price)}
                </span>
              )}
              {isWeightBased && (
                <span className="text-sm text-gray-500">
                  / {isGrams ? 'g' : 'kg'}
                </span>
              )}
            </div>

            {attributes.description && (
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                {attributes.description}
              </p>
            )}
          </div>

          {/* ── Sections ── */}
          <div>

            {/* Weight picker */}
            {isWeightBased && (
              <div className="border-t-[6px] border-[#E5E2DD]">
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-tomato text-base font-bold text-gray-900">
                      Quanto você gostaria?
                    </h3>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                      Obrigatório
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-3">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    {isGrams ? 'Produtos por grama podem variar na pesagem.' : 'Produtos por kg podem variar na pesagem.'}
                  </p>
                  <WeightPicker
                    min={attributes.min_weight || (isGrams ? 100 : 0.1)}
                    max={attributes.max_weight || (isGrams ? 5000 : 10)}
                    step={attributes.measure_interval || (isGrams ? 50 : 0.1)}
                    value={weight}
                    onChange={setWeight}
                    unit={isGrams ? 'g' : 'kg'}
                  />
                  <div className="text-center text-sm text-gray-500 mt-3">
                    {weight} {isGrams ? 'g' : 'kg'} × {formatPrice(hasDiscount ? attributes.price_with_discount! : attributes.price)}/{isGrams ? 'g' : 'kg'}
                    {' = '}
                    <span className="font-semibold text-gray-900">
                      {formatPrice((hasDiscount ? attributes.price_with_discount! : attributes.price) * weight)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Extras */}
            {hasExtras && (
              <div className="border-t-[6px] border-[#E5E2DD]">
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-tomato text-base font-bold text-gray-900">Adicionais</h3>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                      Opcional
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">Selecione os itens que deseja</p>
                  <div className="space-y-0">
                    {attributes.extra.data.map((extra, idx) => (
                      <div
                        key={extra.id}
                        onClick={() =>
                          setSelectedExtras(prev =>
                            prev.includes(extra.id)
                              ? prev.filter(id => id !== extra.id)
                              : [...prev, extra.id]
                          )
                        }
                        className={`flex items-center justify-between py-3.5 cursor-pointer ${
                          idx < attributes.extra.data.length - 1 ? 'border-b border-[#E5E2DD]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <DDCheckbox checked={selectedExtras.includes(extra.id)} />
                          <span className="text-sm text-gray-900">{extra.attributes.name}</span>
                        </div>
                        <span className="text-sm text-gray-500 ml-3 flex-shrink-0">
                          +{formatPrice(parseFloat(extra.attributes.price))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Shared Complements */}
            {attributes.shared_complements?.data?.length > 0 &&
              attributes.shared_complements.data.map(group => (
                <div key={group.id} className="border-t-[6px] border-[#E5E2DD]">
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-tomato text-base font-bold text-gray-900">{group.attributes.name}</h3>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                        Opcional
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">Selecione os itens que deseja</p>
                    <div className="space-y-0">
                      {group.attributes.options.map((option, idx) => (
                        <div
                          key={option.id}
                          onClick={() =>
                            setSelectedSharedComplements(prev =>
                              prev.includes(option.id.toString())
                                ? prev.filter(id => id !== option.id.toString())
                                : [...prev, option.id.toString()]
                            )
                          }
                          className={`flex items-center justify-between py-3.5 cursor-pointer ${
                            idx < group.attributes.options.length - 1 ? 'border-b border-[#E5E2DD]' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <DDCheckbox checked={selectedSharedComplements.includes(option.id.toString())} />
                            <span className="text-sm text-gray-900">{option.name}</span>
                          </div>
                          {Number(option.price) > 0 && (
                            <span className="text-sm text-gray-500 ml-3 flex-shrink-0">
                              +{formatPrice(Number(option.price))}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            }

            {/* Prepare Methods */}
            {hasMethods && (
              <div className="border-t-[6px] border-[#E5E2DD]">
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-tomato text-base font-bold text-gray-900">Modo de Preparo</h3>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                      Opcional
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">Selecione como deseja</p>
                  <div className="space-y-0">
                    {attributes.prepare_method.data.map((method, idx) => (
                      <div
                        key={method.id}
                        onClick={() =>
                          setSelectedMethods(prev =>
                            prev.includes(method.id)
                              ? prev.filter(id => id !== method.id)
                              : [...prev, method.id]
                          )
                        }
                        className={`flex items-center gap-3 py-3.5 cursor-pointer ${
                          idx < attributes.prepare_method.data.length - 1 ? 'border-b border-[#E5E2DD]' : ''
                        }`}
                      >
                        <DDCheckbox checked={selectedMethods.includes(method.id)} />
                        <span className="text-sm text-gray-900">{method.attributes.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Steps / Options (radio) */}
            {hasSteps &&
              attributes.steps.data.map(step => (
                <div key={step.id} className="border-t-[6px] border-[#E5E2DD]">
                  <div className="px-5 py-4">
                    <div className="mb-1">
                      <h3 className="font-tomato text-base font-bold text-gray-900">{step.attributes.name}</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">Selecione 1 opção</p>
                    <div className="space-y-0">
                      {step.attributes.options.data.map((option, idx) => (
                        <label
                          key={option.id}
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [step.id]: option.id }))}
                          className={`flex items-center gap-3 py-3.5 cursor-pointer ${
                            idx < step.attributes.options.data.length - 1 ? 'border-b border-[#E5E2DD]' : ''
                          }`}
                        >
                          <DDRadio checked={selectedOptions[step.id] === option.id} />
                          <span className="text-sm text-gray-900">{option.attributes.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            }

          </div>
        </div>

        {/* ── Footer: quantity + add to cart ── */}
        <div className="flex-shrink-0 border-t border-[#E5E2DD] bg-white px-5 py-4">
          <div className="flex items-center gap-4">
            {/* Quantity selector */}
            {!isWeightBased && (
              <div className="flex items-center rounded-full border border-gray-300 overflow-hidden flex-shrink-0">
                <button
                  className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors cursor-pointer"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4 text-gray-700" />
                </button>
                <span className="w-8 text-center font-bold text-base text-gray-900">{quantity}</span>
                <button
                  className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  <Plus className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            )}

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isUnavailable}
              className={`flex-1 h-12 font-bold text-base rounded-full transition-colors flex items-center justify-center gap-2 ${
                isUnavailable
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90 text-white cursor-pointer'
              }`}
            >
              {isUnavailable ? 'Indisponível' : `Adicionar ${formatPrice(calculatedPrice)}`}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
