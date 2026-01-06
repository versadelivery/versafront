"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CatalogItem } from "./types";
import { formatPrice } from "./format-price";
import { PlusCircle, Utensils, Minus, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useClient } from "./client-context";
import { useCart } from "./cart/cart-context";

interface ProductModalProps {
  product: CatalogItem;
  trigger?: React.ReactNode;
  className?: string;
}

type StepType = 'quantity' | 'extras' | 'methods' | 'options' | 'review';

export default function ProductModal({ product, trigger }: ProductModalProps) {
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
  const [currentStep, setCurrentStep] = useState<StepType | null>(null);
  const [stepsAvailable, setStepsAvailable] = useState<StepType[]>([]);

  const { attributes } = product;
  const isWeightBased = attributes.item_type === "weight_per_kg";
  const hasDiscount = !!attributes.price_with_discount;

  useEffect(() => {
    if (!product) return;

    const availableSteps: StepType[] = ['quantity'];
    
    if (attributes.extra.data.length > 0) {
      availableSteps.push('extras');
    }
    
    if (attributes.prepare_method.data.length > 0) {
      availableSteps.push('methods');
    }
    
    if (attributes.steps.data.length > 0) {
      availableSteps.push('options');
    }
    
    availableSteps.push('review');
    
    setStepsAvailable(availableSteps);
    setCurrentStep(null);
  }, [product]);

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

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      quantity,
      weight: isWeightBased ? weight : undefined,
      selectedExtras,
      selectedMethods,
      selectedOptions,
      totalPrice: calculatePrice()
    }
  
    addItem(cartItem);
    setOpen(false);
    resetModal();
  };

  const calculatePrice = () => {
    const basePrice = hasDiscount 
      ? attributes.price_with_discount! 
      : attributes.price;

    let total = isWeightBased ? basePrice * weight : basePrice * quantity;

    selectedExtras.forEach(extraId => {
      const extra = attributes.extra.data.find(e => e.id === extraId);
      if (extra) {
        total += parseFloat(extra.attributes.price);
      }
    });

    return total;
  };

  const resetModal = () => {
    setQuantity(1);
    setWeight(product.attributes.min_weight || 1);
    setSelectedExtras([]);
    setSelectedMethods([]);
    setSelectedOptions(() => {
      const initialSelections: Record<string, string> = {};
      product.attributes.steps.data.forEach(step => {
        if (step.attributes.options.data.length > 0) {
          initialSelections[step.id] = step.attributes.options.data[0].id;
        }
      });
      return initialSelections;
    });
    setCurrentStep(null);
  };

  const startCustomization = () => {
    setCurrentStep(stepsAvailable[0]);
  };

  const goToNextStep = () => {
    const currentIndex = stepsAvailable.indexOf(currentStep!);
    if (currentIndex < stepsAvailable.length - 1) {
      setCurrentStep(stepsAvailable[currentIndex + 1]);
    }
  };

  const goToPrevStep = () => {
    const currentIndex = stepsAvailable.indexOf(currentStep!);
    if (currentIndex > 0) {
      setCurrentStep(stepsAvailable[currentIndex - 1]);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'quantity':
        return (
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
        );

      case 'extras':
        return (
          <div className="space-y-4">
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
                    +{formatPrice(parseFloat(extra.attributes.price))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'methods':
        return (
          <div className="space-y-4">
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
        );

      case 'options':
        return (
          <div className="space-y-4">
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
        );

      case 'review':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Resumo do Pedido</h3>
            
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item:</span>
                <span className="font-medium">{attributes.name}</span>
              </div>
              
              {isWeightBased ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peso:</span>
                  <span className="font-medium">{weight}kg</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantidade:</span>
                  <span className="font-medium">{quantity}</span>
                </div>
              )}
              
              {selectedExtras.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1">Adicionais:</p>
                  <ul className="space-y-1">
                    {selectedExtras.map(extraId => {
                      const extra = attributes.extra.data.find(e => e.id === extraId);
                      if (!extra) return null;
                      return (
                        <li key={extraId} className="flex justify-between">
                          <span>+ {extra.attributes.name}</span>
                          <span className="text-primary">
                            +{formatPrice(parseFloat(extra.attributes.price))}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              
              {selectedMethods.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1">Modos de preparo:</p>
                  <ul className="space-y-1">
                    {selectedMethods.map(methodId => {
                      const method = attributes.prepare_method.data.find(m => m.id === methodId);
                      if (!method) return null;
                      return (
                        <li key={methodId}>{method.attributes.name}</li>
                      );
                    })}
                  </ul>
                </div>
              )}
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary">{formatPrice(calculatePrice())}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepNavigation = () => {
    if (!currentStep) return null;

    const currentIndex = stepsAvailable.indexOf(currentStep);
    const isFirstStep = currentIndex === 0;
    const isLastStep = currentIndex === stepsAvailable.length - 1;

    return (
      <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-auto">
        {!isFirstStep && (
          <Button 
            variant="outline" 
            onClick={goToPrevStep} 
            className="w-full sm:w-auto gap-2 h-12 order-2 sm:order-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
        )}

        {!isLastStep ? (
          <Button 
            onClick={goToNextStep} 
            className="w-full sm:flex-1 gap-2 h-12 order-1 sm:order-2"
          >
            Continuar
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            className="w-full sm:flex-1 h-12 text-sm sm:text-base font-semibold rounded-lg bg-green-600 hover:bg-green-700 order-1 sm:order-2" 
            onClick={handleAddToCart}
          >
            Adicionar ao carrinho - {formatPrice(calculatePrice())}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetModal();
      }
    }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogTitle className="sr-only">{attributes.name}</DialogTitle>

      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-xl w-[98vw] max-h-full flex flex-col max-sm:p-0">
        <div className="flex flex-col h-full">
          <div className="relative">
            <div className="aspect-video bg-muted max-h-[150px] sm:max-h-[250px] w-full">
              {attributes.image_url ? (
                <Image 
                  src={attributes.image_url}
                  alt={attributes.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover rounded-t-xl max-sm:rounded-t-lg"
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

          <div className="flex flex-col overflow-y-auto p-3 sm:p-6 max-h-[calc(95vh-250px)] sm:max-h-[calc(90vh-350px)]">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 break-words">{attributes.name}</h2>
            
            <div className="flex items-baseline gap-2 sm:gap-3 mb-4 flex-wrap">
              <span className={`text-xl sm:text-2xl font-bold ${hasDiscount ? 'text-primary' : 'text-foreground'}`}> 
                {formatPrice(calculatePrice())}
              </span>

              {hasDiscount && (
                <span className="text-muted-foreground text-lg line-through">
                  {formatPrice(attributes.price * (isWeightBased ? weight : quantity))}
                </span>
              )}

              {isWeightBased && (
                <Badge variant="outline" className="ml-2 bg-muted/50">
                  {formatPrice(attributes.price)}/kg
                </Badge>
              )}
            </div>

            {attributes.description && (
              <p className="text-muted-foreground mb-6">
                {attributes.description}
              </p>
            )}

            {!currentStep ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg sm:text-xl">Detalhes do Produto</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Este produto pode ser personalizado de acordo com suas preferências.
                  </p>
                </div>

                <Button 
                  className="w-full py-3 sm:py-6 text-base sm:text-lg font-medium rounded-full" 
                  size="lg" 
                  onClick={startCustomization}
                >
                  Iniciar pedido
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">
                      Passo {stepsAvailable.indexOf(currentStep) + 1} de {stepsAvailable.length}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {currentStep === 'quantity' ? 'Definir Quantidade' : 
                       currentStep === 'extras' ? 'Adicionais Extras' : 
                       currentStep === 'methods' ? 'Modo de Preparo' : 
                       currentStep === 'options' ? 'Escolher Opções' : 'Revisar Pedido'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${((stepsAvailable.indexOf(currentStep) + 1) / stepsAvailable.length) * 100}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <Separator />

                {renderStepContent()}
                {renderStepNavigation()}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}