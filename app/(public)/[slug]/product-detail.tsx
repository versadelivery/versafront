"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Separator } from "@/app/components/ui/separator";
import { Slider } from "@/app/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Checkbox } from "@/app/components/ui/checkbox";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/app/components/ui/accordion";
import { Badge } from "@/app/components/ui/badge";
import { CatalogItem } from "./types";
import { formatPrice } from "./format-price";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle, Utensils, Minus, Plus, X } from "lucide-react";
import { useClient } from "./client-context";
import { useCart } from "./cart/cart-context";

interface ProductModalProps {
  product: CatalogItem;
  trigger?: React.ReactNode;
  className?: string;
}

export default function ProductModal({ product, trigger, className }: ProductModalProps) {
  const router = useRouter();
  const { client } = useClient();
  const { slug } = useParams();
  const { addItem } = useCart();

  if (!product) {
    return null;
  }

  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState(product.attributes.min_weight || 1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initialSelections: Record<string, string> = {};
    product.attributes.steps.data.forEach(step => {
      if (step.attributes.options.data.length > 0) {
        initialSelections[step.id] = step.attributes.options.data[0].id;
      }
    });
    return initialSelections;
  });

  const { attributes } = product;
  const isWeightBased = attributes.item_type === "weight_per_kg";
  const hasDiscount = !!attributes.price_with_discount;

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleWeightChange = (value: number[]) => {
    setWeight(value[0]);
  };

  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const handleMethodToggle = (methodId: string) => {
    setSelectedMethods(prev => 
      prev.includes(methodId) 
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    );
  };

  function handleAddToCart() {
    if (!client) {
      router.push(`/${slug as string}/auth`);
      return; 
    }

    const cartItem = {
      ...product,
      quantity,
      weight: isWeightBased ? weight : undefined,
      selectedExtras,
      selectedMethods,
      selectedOptions,
      totalPrice: calculatePrice()
    }
  
    addItem(cartItem)
    setOpen(false)
    }

  const calculatePrice = () => {
    const basePrice = hasDiscount 
      ? attributes.price_with_discount! 
      : attributes.price;

    let total = isWeightBased ? basePrice * weight : basePrice * quantity;

    selectedExtras.forEach(extraId => {
      const extra = attributes.extra.data.find(e => e.id === extraId);
      if (extra) {
        total += parseFloat(extra.attributes.price) * (isWeightBased ? weight : quantity);
      }
    });

    return total;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogTitle className="sr-only">{attributes.name}</DialogTitle>

      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-xl">
        <div className="flex flex-col max-h-[80vh]">
          <div className="relative">
            <div className="aspect-video bg-muted">
              {attributes.image_url ? (
                <Image 
                  src={attributes.image_url}
                  alt={attributes.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-4xl text-muted-foreground/20">Produto</div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setOpen(false)} 
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">
                -{Math.round(((attributes.price - (attributes.price_with_discount || 0)) / attributes.price * 100))}%
              </div>
            )}
          </div>

          <div className="flex flex-col overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">{attributes.name}</h2>
            
            <div className="flex items-baseline gap-3 mb-4">
              <span className={`text-2xl font-bold ${hasDiscount ? 'text-primary' : 'text-foreground'}`}>
                {formatPrice(calculatePrice())}
              </span>

              {hasDiscount && (
                <span className="text-muted-foreground text-lg line-through">
                  {formatPrice(attributes.price * (isWeightBased ? weight : quantity))}
                </span>
              )}

              {isWeightBased && (
                <Badge variant="outline" className="ml-2 bg-muted/50">
                  {formatCurrency(attributes.price)}/kg
                </Badge>
              )}
            </div>

            {attributes.description && (
              <p className="text-muted-foreground mb-6">
                {attributes.description}
              </p>
            )}

            <div className="space-y-6">
              <div className="pt-2">
                <Label className="text-sm font-medium mb-2">
                  {isWeightBased ? "Peso (kg)" : "Quantidade"}
                </Label>

                {isWeightBased ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full border border-border hover:bg-muted"
                        onClick={() => handleWeightChange([Math.max((attributes.min_weight || 1), weight - (attributes.measure_interval || 0.5))])}
                        disabled={weight <= (attributes.min_weight || 1)}
                        aria-label="Diminuir peso"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex-1">
                        <Slider
                          value={[weight]}
                          min={attributes.min_weight || 1}
                          max={attributes.max_weight || 10}
                          step={attributes.measure_interval || 0.5}
                          onValueChange={handleWeightChange}
                          className="mr-2"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full border border-border hover:bg-muted"
                        onClick={() => handleWeightChange([Math.min((attributes.max_weight || 10), weight + (attributes.measure_interval || 0.5))])}
                        disabled={weight >= (attributes.max_weight || 10)}
                        aria-label="Aumentar peso"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{attributes.min_weight || 1}kg</span>
                      <span className="font-semibold text-primary">{weight}kg</span>
                      <span>{attributes.max_weight || 10}kg</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center border border-border rounded-full overflow-hidden w-fit">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-muted"
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-medium">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 hover:bg-muted"
                      onClick={handleIncrement}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {attributes.extra.data.length > 0 && (
                <div className="space-y-4">
                  <Separator className="my-2" />
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    <span className="bg-primary/10 text-primary p-1.5 rounded-full">
                      <PlusCircle className="w-5 h-5" />
                    </span>
                    Adicionais
                  </h3>
                  <p className="text-sm text-muted-foreground">Personalize seu pedido</p>
                  <div className="grid gap-2">
                    {attributes.extra.data.map((extra) => (
                      <div 
                        key={extra.id} 
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${selectedExtras.includes(extra.id) ? 'border border-primary bg-primary/5' : 'border border-border hover:border-muted-foreground/40'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            id={`extra-${extra.id}`}
                            checked={selectedExtras.includes(extra.id)}
                            onCheckedChange={() => handleExtraToggle(extra.id)}
                            className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary bg-muted-foreground/20"
                          />
                          <div>
                            <Label htmlFor={`extra-${extra.id}`} className="cursor-pointer font-medium">
                              {extra.attributes.name}
                            </Label>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-primary">
                          +{formatCurrency(parseFloat(extra.attributes.price))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {attributes.prepare_method.data.length > 0 && (
                <div className="space-y-4">
                  <Separator className="my-2" />
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    <span className="bg-primary/10 text-primary p-1.5 rounded-full">
                      <Utensils className="w-5 h-5" />
                    </span>
                    Modos de preparo
                  </h3>
                  <p className="text-sm text-muted-foreground">Escolha como deseja seu prato</p>
                  <div className="grid gap-2">
                    {attributes.prepare_method.data.map((method) => (
                      <div 
                        key={method.id} 
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${selectedMethods.includes(method.id) ? 'border border-primary bg-primary/5' : 'border border-border hover:border-muted-foreground/40'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            id={`method-${method.id}`}
                            checked={selectedMethods.includes(method.id)}
                            onCheckedChange={() => handleMethodToggle(method.id)}
                            className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary bg-muted-foreground/20"
                          />
                          <div>
                            <Label htmlFor={`method-${method.id}`} className="cursor-pointer font-medium">
                              {method.attributes.name}
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {attributes.steps.data.length > 0 && (
                <div className="space-y-4">
                  <Separator className="my-2" />
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    <span className="bg-primary/10 text-primary p-1.5 rounded-full">
                      <Utensils className="w-5 h-5" />
                    </span>
                    Etapas do item
                  </h3>
                  <p className="text-sm text-muted-foreground">Personalize ao seu gosto</p>
                  <Accordion 
                    type="multiple" 
                    defaultValue={attributes.steps.data.map(step => step.id)} 
                    className="w-full space-y-2"
                  >
                    {attributes.steps.data.map((step) => (
                      <div 
                        key={step.id} 
                        className="border border-border rounded-lg overflow-hidden hover:border-muted-foreground/40 transition-all"
                      >
                        <AccordionItem value={step.id} className="border-none">
                          <AccordionTrigger className="hover:no-underline px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-left font-medium">
                                {step.attributes.name}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3 pt-1">
                            <RadioGroup 
                              value={selectedOptions[step.id]} 
                              onValueChange={(value) => setSelectedOptions(prev => ({
                                ...prev,
                                [step.id]: value
                              }))}
                              className="space-y-2"
                            >
                              {step.attributes.options.data.map((option) => (
                                <div 
                                  key={option.id} 
                                  className={`flex items-start gap-3 p-3 rounded-lg transition-all ${selectedOptions[step.id] === option.id ? 'border border-primary bg-primary/5' : 'border border-border hover:border-muted-foreground/40'}`}
                                >
                                  <RadioGroupItem 
                                    value={option.id} 
                                    id={`option-${step.id}-${option.id}`} 
                                    className="h-5 w-5 rounded-full bg-muted-foreground/20"
                                  />
                                  <div className="flex-1">
                                    <Label 
                                      htmlFor={`option-${step.id}-${option.id}`}
                                      className="cursor-pointer font-medium"
                                    >
                                      {option.attributes.name}
                                    </Label>
                                  </div>
                                </div>
                              ))}
                            </RadioGroup>
                          </AccordionContent>
                        </AccordionItem>
                      </div>
                    ))}
                  </Accordion>
                </div>
              )}

              <div className="pt-2 sticky bottom-0 bg-background pb-4">
                <Button 
                  className="w-full py-6 text-base font-medium rounded-full" 
                  size="lg" 
                  onClick={handleAddToCart}
                >
                  Adicionar ao carrinho - {formatPrice(calculatePrice())}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}