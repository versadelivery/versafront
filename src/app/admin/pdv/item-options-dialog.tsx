"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, ShoppingCart } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package } from "lucide-react";
import { formatPrice } from "@/utils/format-price";

interface ItemOptionsDialogProps {
  item: any | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (options: {
    extrasPrice: number;
    observation: string;
    selectedExtras: { id: string; name: string; price: number }[];
    selectedMethods: { id: string; name: string }[];
    selectedOptions: Record<string, { optionId: string; optionName: string }>;
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
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [observation, setObservation] = useState("");

  // Reset e pré-selecionar primeira opção de cada step ao abrir
  useEffect(() => {
    if (open && item) {
      setSelectedExtraIds([]);
      setSelectedMethodIds([]);
      const initOptions: Record<string, string> = {};
      const steps: any[] = item.attributes?.steps?.data ?? [];
      steps.forEach((step: any) => {
        const opts: any[] = step.attributes?.options?.data ?? [];
        if (opts.length > 0) initOptions[step.id] = opts[0].id;
      });
      setSelectedOptions(initOptions);
      setObservation("");
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

  const totalPrice = basePrice + extrasTotal;

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

    onAddToCart({
      extrasPrice: extrasTotal,
      observation,
      selectedExtras: selectedExtrasData,
      selectedMethods: selectedMethodsData,
      selectedOptions: selectedOptionsData,
    });
    onClose();
  };

  if (!item) return null;
  const attrs = item.attributes;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 bg-white max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-bold text-gray-900">
            Personalizar item
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">
            {/* Produto */}
            <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {attrs.image_url ? (
                  <Image
                    src={attrs.image_url}
                    alt={attrs.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-bold text-gray-900 text-base leading-tight">
                  {attrs.name}
                </h3>
                {attrs.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {attrs.description}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  {hasDiscount ? (
                    <>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(parseFloat(attrs.price))}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(parseFloat(attrs.price_with_discount))}
                      </span>
                      <Badge variant="destructive" className="text-[10px] h-5">
                        PROMOÇÃO
                      </Badge>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(basePrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Extras */}
            {extras.length > 0 && (
              <section className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Adicionais
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Selecione quantos quiser
                  </p>
                </div>
                <div className="space-y-2">
                  {extras.map((extra: any) => {
                    const isSelected = selectedExtraIds.includes(extra.id);
                    const price = parseFloat(extra.attributes.price || "0");
                    return (
                      <label
                        key={extra.id}
                        htmlFor={`extra-${extra.id}`}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <Checkbox
                          id={`extra-${extra.id}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleExtra(extra.id)}
                        />
                        <span
                          className={`flex-1 text-sm font-medium ${
                            isSelected ? "text-primary" : "text-gray-700"
                          }`}
                        >
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
            )}

            {/* Modo de preparo */}
            {methods.length > 0 && (
              <>
                {extras.length > 0 && <Separator />}
                <section className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Modo de preparo
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Selecione quantos quiser
                    </p>
                  </div>
                  <div className="space-y-2">
                    {methods.map((method: any) => {
                      const isSelected = selectedMethodIds.includes(method.id);
                      return (
                        <label
                          key={method.id}
                          htmlFor={`method-${method.id}`}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <Checkbox
                            id={`method-${method.id}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleMethod(method.id)}
                          />
                          <span
                            className={`flex-1 text-sm font-medium ${
                              isSelected ? "text-primary" : "text-gray-700"
                            }`}
                          >
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
            {steps.map((step: any, idx: number) => {
              const opts: any[] = step.attributes?.options?.data ?? [];
              if (opts.length === 0) return null;
              const showSep =
                idx > 0 || extras.length > 0 || methods.length > 0;
              return (
                <div key={step.id}>
                  {showSep && <Separator className="mb-5" />}
                  <section className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {step.attributes.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Escolha uma opção
                      </p>
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
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <RadioGroupItem
                              value={option.id}
                              id={`opt-${step.id}-${option.id}`}
                            />
                            <span
                              className={`flex-1 text-sm font-medium ${
                                isSelected ? "text-primary" : "text-gray-700"
                              }`}
                            >
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

            {/* Observação */}
            {(extras.length > 0 ||
              methods.length > 0 ||
              steps.length > 0) && <Separator />}
            <section className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Observação
              </p>
              <Textarea
                placeholder="Ex: sem cebola, bem passado..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </section>
          </div>
        </ScrollArea>

        {/* Footer fixo com total + botão */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-1.5 mr-auto">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(totalPrice)}
            </span>
            {extrasTotal > 0 && (
              <span className="text-xs text-green-600">
                (+{formatPrice(extrasTotal)} adicionais)
              </span>
            )}
          </div>
          <Button variant="outline" onClick={onClose} className="shrink-0">
            Cancelar
          </Button>
          <Button onClick={handleAddToCart} className="gap-2 shrink-0">
            <ShoppingCart className="h-4 w-4" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
