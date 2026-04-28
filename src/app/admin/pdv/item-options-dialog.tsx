"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ShoppingCart, Scale, Plus, ChefHat, ListChecks, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { formatPrice } from "@/utils/format-price";

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
        className="absolute inset-x-0 z-0 pointer-events-none bg-[#FAF9F7]"
        style={{ top: ITEM_H * PAD, height: ITEM_H, borderTop: '1px solid #E5E2DD', borderBottom: '1px solid #E5E2DD' }}
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

interface ItemOptionsDialogProps {
  item: any | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (options: {
    extrasPrice: number;
    complementsPrice: number;
    observation: string;
    selectedExtras: { id: string; name: string; price: number }[];
    selectedMethods: { id: string; name: string }[];
    selectedOptions: Record<string, { optionId: string; optionName: string }>;
    selectedSharedComplements: { id: string; name: string; price: number }[];
    weight?: number;
  }) => void;
}

export function ItemOptionsDialog({
  item,
  open,
  onClose,
  onAddToCart,
}: ItemOptionsDialogProps) {
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [selectedMethodIds, setSelectedMethodIds] = useState<string[]>([]);
  const [selectedSharedComplementIds, setSelectedSharedComplementIds] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [observation, setObservation] = useState("");
  const [weight, setWeight] = useState<number>(1);

  // Reset e pré-selecionar primeira opção de cada step ao abrir
  useEffect(() => {
    if (open && item) {
      setSelectedExtraIds([]);
      setSelectedMethodIds([]);
      setSelectedSharedComplementIds([]);
      const initOptions: Record<string, string> = {};
      const steps: any[] = item.attributes?.steps?.data ?? [];
      steps.forEach((step: any) => {
        const opts: any[] = step.attributes?.options?.data ?? [];
        if (opts.length > 0) initOptions[step.id] = opts[0].id;
      });
      setSelectedOptions(initOptions);
      setObservation("");
      // Inicializar peso para itens por peso (mesma lógica do client-side)
      const attrs = item.attributes;
      if (attrs?.item_type === 'weight_per_g') {
        setWeight(attrs.min_weight || 100);
      } else if (attrs?.item_type === 'weight_per_kg') {
        setWeight(attrs.min_weight || 0.1);
      }
    }
  }, [open, item]);

  const extras: any[] = useMemo(
    () => item?.attributes?.extra?.data ?? [],
    [item]
  );
  const methods: any[] = useMemo(
    () => item?.attributes?.prepare_method?.data ?? [],
    [item]
  );
  const steps: any[] = useMemo(
    () => item?.attributes?.steps?.data ?? [],
    [item]
  );
  const sharedComplements: any[] = useMemo(
    () => item?.attributes?.shared_complements?.data ?? [],
    [item]
  );

  const isWeightBased = useMemo(() => {
    if (!item) return false;
    return item.attributes.item_type === 'weight_per_kg' || item.attributes.item_type === 'weight_per_g';
  }, [item]);

  const isGrams = useMemo(() => {
    return item?.attributes?.item_type === 'weight_per_g';
  }, [item]);

  const weightUnit = isGrams ? 'g' : 'kg';

  const hasDiscount = useMemo(() => {
    if (!item) return false;
    return (
      item.attributes.price_with_discount &&
      item.attributes.price_with_discount !== item.attributes.price
    );
  }, [item]);

  const basePrice = useMemo(() => {
    if (!item) return 0;
    return hasDiscount
      ? parseFloat(item.attributes.price_with_discount)
      : parseFloat(item.attributes.price);
  }, [item, hasDiscount]);

  const extrasTotal = useMemo(() => {
    return selectedExtraIds.reduce((sum, id) => {
      const extra = extras.find((e: any) => e.id === id);
      return sum + (extra ? parseFloat(extra.attributes.price || "0") : 0);
    }, 0);
  }, [selectedExtraIds, extras]);

  const complementsTotal = useMemo(() => {
    return selectedSharedComplementIds.reduce((sum, optionId) => {
      for (const group of sharedComplements) {
        const option = (group.attributes?.options ?? []).find(
          (o: any) => o.id.toString() === optionId
        );
        if (option) return sum + Number(option.price || 0);
      }
      return sum;
    }, 0);
  }, [selectedSharedComplementIds, sharedComplements]);

  const totalPrice = isWeightBased
    ? basePrice * weight + extrasTotal + complementsTotal
    : basePrice + extrasTotal + complementsTotal;

  const toggleExtra = (id: string) => {
    setSelectedExtraIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleMethod = (id: string) => {
    setSelectedMethodIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSharedComplement = (optionId: string) => {
    setSelectedSharedComplementIds((prev) =>
      prev.includes(optionId) ? prev.filter((x) => x !== optionId) : [...prev, optionId]
    );
  };

  const handleAddToCart = () => {
    const selectedExtrasData = selectedExtraIds.map((id) => {
      const extra = extras.find((e: any) => e.id === id)!;
      return {
        id,
        name: extra.attributes.name,
        price: parseFloat(extra.attributes.price || "0"),
      };
    });

    const selectedMethodsData = selectedMethodIds.map((id) => {
      const method = methods.find((m: any) => m.id === id)!;
      return { id, name: method.attributes.name };
    });

    const selectedOptionsData: Record<
      string,
      { optionId: string; optionName: string }
    > = {};
    steps.forEach((step: any) => {
      const optionId = selectedOptions[step.id];
      if (optionId) {
        const option = (step.attributes?.options?.data ?? []).find(
          (o: any) => o.id === optionId
        );
        selectedOptionsData[step.id] = {
          optionId,
          optionName: option?.attributes?.name ?? "",
        };
      }
    });

    const selectedSharedComplementsData = selectedSharedComplementIds.map((optionId) => {
      for (const group of sharedComplements) {
        const option = (group.attributes?.options ?? []).find(
          (o: any) => o.id.toString() === optionId
        );
        if (option) {
          return { id: optionId, name: option.name, price: Number(option.price || 0) };
        }
      }
      return { id: optionId, name: "", price: 0 };
    });

    onAddToCart({
      extrasPrice: extrasTotal,
      complementsPrice: complementsTotal,
      observation,
      selectedExtras: selectedExtrasData,
      selectedMethods: selectedMethodsData,
      selectedOptions: selectedOptionsData,
      selectedSharedComplements: selectedSharedComplementsData,
      ...(isWeightBased && { weight }),
    });
    onClose();
  };

  if (!item) return null;
  const attrs = item.attributes;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[640px] p-0 bg-white max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header com nome do produto */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E2DD] flex-shrink-0">
          <DialogTitle className="font-tomato text-lg font-bold text-gray-900 truncate">
            {attrs.name}
          </DialogTitle>
        </DialogHeader>

        {/* Body scrollável */}
        <div className="flex-1 overflow-y-auto bg-[#FAF9F7]">
          {/* Imagem do produto */}
          {attrs.image_url ? (
            <div className="relative w-full h-48 bg-[#F0EFEB]">
              <Image
                src={attrs.image_url}
                alt={attrs.name}
                fill
                sizes="640px"
                className="object-cover"
              />
              {hasDiscount && (
                <div className="absolute top-3 right-3">
                  <Badge variant="destructive" className="text-xs rounded-md">
                    PROMOÇÃO
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-32 bg-[#F0EFEB] flex items-center justify-center">
              <Package className="h-10 w-10 text-[#E5E2DD]" />
            </div>
          )}

          <div className="px-6 py-5 space-y-5">
            {/* Info do produto */}
            <div className="space-y-2">
              {attrs.description && (
                <p className="text-sm text-muted-foreground">
                  {attrs.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                {hasDiscount ? (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(parseFloat(attrs.price))}{isWeightBased ? `/${weightUnit}` : ''}
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(parseFloat(attrs.price_with_discount))}{isWeightBased ? `/${weightUnit}` : ''}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(basePrice)}{isWeightBased ? `/${weightUnit}` : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Peso (kg / g) */}
            {isWeightBased && (
              <>
                <hr className="border-[#E5E2DD]" />
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-gray-900">Quantidade ({weightUnit})</h3>
                  </div>
                  <WeightPicker
                    min={item.attributes.min_weight || (isGrams ? 100 : 0.1)}
                    max={item.attributes.max_weight || (isGrams ? 5000 : 10)}
                    step={item.attributes.measure_interval || (isGrams ? 50 : 0.1)}
                    value={weight}
                    onChange={setWeight}
                    unit={weightUnit}
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {weight} {weightUnit} × {formatPrice(basePrice)}/{weightUnit}
                    {' = '}
                    <span className="font-semibold text-primary">
                      {formatPrice(basePrice * weight)}
                    </span>
                  </div>
                </section>
              </>
            )}

            {/* Extras */}
            {extras.length > 0 && (
              <>
                <hr className="border-[#E5E2DD]" />
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-gray-900">Adicionais</h3>
                    <span className="text-xs text-muted-foreground">— selecione quantos quiser</span>
                  </div>
                  <div className="space-y-2">
                    {extras.map((extra: any) => {
                      const isSelected = selectedExtraIds.includes(extra.id);
                      const price = parseFloat(extra.attributes.price || "0");
                      return (
                        <label
                          key={extra.id}
                          htmlFor={`extra-${extra.id}`}
                          className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                            isSelected
                              ? "border-primary bg-white"
                              : "border-[#E5E2DD] bg-white hover:border-primary/40"
                          }`}
                        >
                          <Checkbox
                            id={`extra-${extra.id}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleExtra(extra.id)}
                          />
                          <span className="flex-1 text-sm font-medium text-gray-900">
                            {extra.attributes.name}
                          </span>
                          {price > 0 && (
                            <span className="text-sm font-semibold text-green-600">
                              +{formatPrice(price)}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {/* Modo de preparo */}
            {methods.length > 0 && (
              <>
                <hr className="border-[#E5E2DD]" />
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-gray-900">Modo de preparo</h3>
                    <span className="text-xs text-muted-foreground">— selecione quantos quiser</span>
                  </div>
                  <div className="space-y-2">
                    {methods.map((method: any) => {
                      const isSelected = selectedMethodIds.includes(method.id);
                      return (
                        <label
                          key={method.id}
                          htmlFor={`method-${method.id}`}
                          className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                            isSelected
                              ? "border-primary bg-white"
                              : "border-[#E5E2DD] bg-white hover:border-primary/40"
                          }`}
                        >
                          <Checkbox
                            id={`method-${method.id}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleMethod(method.id)}
                          />
                          <span className="flex-1 text-sm font-medium text-gray-900">
                            {method.attributes.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {/* Etapas (steps) */}
            {steps.map((step: any) => {
              const opts: any[] = step.attributes?.options?.data ?? [];
              if (opts.length === 0) return null;
              return (
                <div key={step.id}>
                  <hr className="border-[#E5E2DD] mb-5" />
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-gray-900">{step.attributes.name}</h3>
                      <span className="text-xs text-muted-foreground">— escolha uma opção</span>
                    </div>
                    <RadioGroup
                      value={selectedOptions[step.id] ?? ""}
                      onValueChange={(val) =>
                        setSelectedOptions((prev) => ({
                          ...prev,
                          [step.id]: val,
                        }))
                      }
                      className="space-y-2"
                    >
                      {opts.map((option: any) => {
                        const isSelected =
                          selectedOptions[step.id] === option.id;
                        return (
                          <label
                            key={option.id}
                            htmlFor={`opt-${step.id}-${option.id}`}
                            className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                              isSelected
                                ? "border-primary bg-white"
                                : "border-[#E5E2DD] bg-white hover:border-primary/40"
                            }`}
                          >
                            <RadioGroupItem
                              value={option.id}
                              id={`opt-${step.id}-${option.id}`}
                            />
                            <span className="flex-1 text-sm font-medium text-gray-900">
                              {option.attributes.name}
                            </span>
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </section>
                </div>
              );
            })}

            {/* Complementos Compartilhados */}
            {sharedComplements.length > 0 && (
              <>
                <hr className="border-[#E5E2DD]" />
                <section className="space-y-4">
                  {sharedComplements.map((group: any) => {
                    const options: any[] = group.attributes?.options ?? [];
                    if (options.length === 0) return null;
                    return (
                      <div key={group.id} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-semibold text-gray-900">{group.attributes.name}</h3>
                          <span className="text-xs text-muted-foreground">— selecione quantos quiser</span>
                        </div>
                        <div className="space-y-2">
                          {options.map((option: any) => {
                            const optId = option.id.toString();
                            const isSelected = selectedSharedComplementIds.includes(optId);
                            const price = Number(option.price || 0);
                            return (
                              <label
                                key={optId}
                                htmlFor={`complement-${optId}`}
                                className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                                  isSelected
                                    ? "border-primary bg-white"
                                    : "border-[#E5E2DD] bg-white hover:border-primary/40"
                                }`}
                              >
                                <Checkbox
                                  id={`complement-${optId}`}
                                  checked={isSelected}
                                  onCheckedChange={() => toggleSharedComplement(optId)}
                                />
                                <span className="flex-1 text-sm font-medium text-gray-900">
                                  {option.name}
                                </span>
                                {price > 0 && (
                                  <span className="text-sm font-semibold text-green-600">
                                    +{formatPrice(price)}
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </section>
              </>
            )}

            {/* Observação */}
            <hr className="border-[#E5E2DD]" />
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-gray-900">Observação</h3>
              </div>
              <Textarea
                placeholder="Ex: sem cebola, bem passado..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={3}
                className="resize-none text-sm bg-white"
              />
            </section>
          </div>
        </div>

        {/* Footer fixo */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-[#E5E2DD] bg-white flex-shrink-0">
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(totalPrice)}
            </span>
            {(extrasTotal > 0 || complementsTotal > 0) && (
              <span className="text-xs text-green-600">
                (+{formatPrice(extrasTotal + complementsTotal)})
              </span>
            )}
          </div>
          <Button variant="outline" onClick={onClose} className="shrink-0 border border-gray-300 cursor-pointer">
            Cancelar
          </Button>
          <Button onClick={handleAddToCart} className="gap-2 shrink-0 border border-gray-300 cursor-pointer">
            <ShoppingCart className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
