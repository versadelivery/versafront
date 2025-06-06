"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";  
import Image from "next/image";
import { Camera, Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { ItemExtras, Extra } from "./item-extras-create"
import { ItemPrepareMethods, PrepareMethod } from "./item-prepare-methods-create"
import { ItemSteps } from "./item-steps-create";
import { useCatalogGroup } from "../../../app/admin/catalog/useCatalogGroup";
interface NewItemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Step {
  name: string;
  options: { name: string }[];
  id?: string;
}

const itemSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  description: z.string().min(1, { message: 'Descrição é obrigatória' }),
  catalog_group_id: z.string().min(0, { message: 'Grupo é obrigatório' }),
  image: z.instanceof(File).optional(),
  price: z.number().min(0, { message: 'Preço é obrigatório' }),
  item_type: z.enum(['unit', 'weight_per_kg', 'weight_per_g'], { message: 'Tipo de unidade é obrigatório' }),
  min_weight: z.number().min(0).optional(),
  max_weight: z.number().min(0).optional(),
  measure_interval: z.number().min(0).optional(),
  price_with_discount: z.number().min(0).optional(),
  catalog_item_extras_attributes: z.array(
    z.object({ 
      name: z.string().min(1, { message: 'Nome do adicional é obrigatório' }), 
      price: z.number().min(0.01, { message: 'Preço deve ser maior que zero' })
    })
  ).optional(),
  catalog_item_prepare_methods_attributes: z.array(z.object({ name: z.string() })).optional(),
  catalog_item_steps_attributes: z.array(z.object({ name: z.string(), catalog_item_step_options_attributes: z.array(z.object({ name: z.string() })) })).optional(),
});

export function NewItemModal({ isOpen, onOpenChange }: NewItemModalProps) {
  const { catalog, isLoading, createCatalogItem, isCreatingItem } = useCatalogGroup();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [hasExtras, setHasExtras] = useState(false);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [prepareMethods, setPrepareMethods] = useState<{ name: string }[]>([]);
  const [hasPrepareMethods, setHasPrepareMethods] = useState(false);
  const [hasSteps, setHasSteps] = useState(false);
  const [steps, setSteps] = useState<{ name: string; options: { name: string }[] }[]>([]);

  
  const handlePriceChange = (value: string) => {
    const numValue = parseFloat(value.replace(/\D/g, '')) / 100 || 0
    return numValue
  }

  const handleStepOptionChange = (stepIndex: number, optionIndex: number, value: string) => {
    setSteps(prev => prev.map((step, i) => i === stepIndex ? { ...step, options: step.options.map((option, j) => j === optionIndex ? { ...option, name: value } : option) } : step));
  }

  const handleAddStepOption = (stepIndex: number) => {
    setSteps(prev => prev.map((step, i) => i === stepIndex ? { ...step, options: [...step.options, { name: '' }] } : step));
  }
  
  const handleRemoveStepOption = (stepIndex: number, optionIndex: number) => {
    setSteps(prev => prev.map((step, i) => i === stepIndex ? { ...step, options: step.options.filter((_, j) => j !== optionIndex) } : step));
  }
  
  const formatPrice = (price: number) => {
    if (price !== 0) {
      return price.toFixed(2).replace('.', ',')
    } else {
      return '0,00'
    }
  }
  
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      catalog_group_id: catalog?.data[0]?.id || '',
      image: undefined,
      price: 0,
      price_with_discount: 0,
      item_type: 'unit' as 'unit' | 'weight_per_kg' | 'weight_per_g',
      min_weight: 0,
      max_weight: 0,
      measure_interval: 0,
    },
    resolver: zodResolver(itemSchema)
  });

  useEffect(() => {
    if (hasDiscount) {
      form.setValue('price_with_discount', form.getValues('price_with_discount') as number);
    } else {
      form.setValue('price_with_discount', undefined);
    }
    if (hasExtras) {
      form.setValue('catalog_item_extras_attributes', extras);
    } else {
      form.setValue('catalog_item_extras_attributes', undefined);
    }
    if (hasPrepareMethods) {
      form.setValue('catalog_item_prepare_methods_attributes', prepareMethods);
    } else {
      form.setValue('catalog_item_prepare_methods_attributes', undefined);
    }
    if (hasSteps) {
      form.setValue('catalog_item_steps_attributes', steps.map(step => ({ ...step, catalog_item_step_options_attributes: step.options.map(option => ({ name: option.name })) })));
    } else {
      form.setValue('catalog_item_steps_attributes', undefined);
    }
  }, [hasExtras, hasPrepareMethods, hasSteps, hasDiscount]);

  useEffect(() => {
    if (catalog?.data[0]?.id) {
      form.setValue('catalog_group_id', catalog.data[0].id);
    }
  }, [catalog, form]);

  const handleAddPrepareMethod = () => {
    setPrepareMethods(prev => [...prev, { name: '' }]);
  };

  const handleRemovePrepareMethod = (index: number) => {
    setPrepareMethods(prev => prev.filter((_, i) => i !== index));
    if (prepareMethods.length === 1) {
      setHasPrepareMethods(false);
    }
  };

  const handlePrepareMethodChange = (index: number, field: keyof PrepareMethod, value: string) => {
    setPrepareMethods(prev => prev.map((method, i) => i === index ? { ...method, [field]: value } : method));
  };

  const handlePrepareMethodsToggle = (checked: boolean) => {
    setHasPrepareMethods(checked);
    if (checked) {
      setPrepareMethods([{ name: '' }]);
    } else {
      setPrepareMethods([]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue('image', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChangeImageClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        form.setValue('image', file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewImage(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleDiscountToggle = (checked: boolean) => {
    setHasDiscount(checked);
    if (checked) {
      form.setValue('price_with_discount', form.getValues('price'));
    } else {
      form.setValue('price_with_discount', undefined);
    }
  }
  
  const handleExtraChange = (index: number, field: keyof Extra, value: string | number) => {
    setExtras(prev => prev.map((extra, i) => i === index ? { ...extra, [field]: value } : extra));
  };

  const handleRemoveExtra = (index: number) => {
    setExtras(prev => prev.filter((_, i) => i !== index));
    if (extras.length === 1) {
      setHasExtras(false);
    }
  };

  const handleAddExtra = () => {
    setExtras(prev => [...prev, { name: '', price: 0 }]);
  };

  const handleHasDiscountToggle = (checked: boolean) => {
    setHasDiscount(checked);
    if (checked) {
      form.setValue('price_with_discount', form.getValues('price'));
    } else {
      form.setValue('price_with_discount', undefined);
    }
  }
  const handleExtrasToggle = (checked: boolean) => {
    setHasExtras(checked);
    if (checked) {
      setExtras([{ name: '', price: 0 }]);
    } else {
      setExtras([]);
    }
  };

  const handleStepChange = (stepIndex: number, field: keyof Step, value: string) => {
    setSteps(prev => prev.map((step, i) => i === stepIndex ? { ...step, [field]: value } : step));
  };

  const handleRemoveStep = (index: number) => {
    setSteps(prev => {
      const newSteps = prev.filter((_, i) => i !== index);
      if (newSteps.length === 0) {
        setHasSteps(false);
      }
      return newSteps;
    });
  };

  const handleAddStep = () => {
    setSteps(prev => [...prev, { name: '', options: [{ name: '' }] }]);
  };

  const handleStepsToggle = (checked: boolean) => {
    setHasSteps(checked);
    if (checked) {
      setSteps([{ name: '', options: [{ name: '' }] }]);
    } else {
      setSteps([]);
    }
  };

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('item_type', data.item_type);
    formData.append('unit_of_measurement', data.item_type === 'weight_per_kg' ? 'weight_per_kg' : data.item_type === 'weight_per_g' ? 'weight_per_g' : '');
    formData.append('price', data.price.toString());
    formData.append('catalog_group_id', data.catalog_group_id);
    if (hasDiscount) {
      formData.append('price_with_discount', data.price_with_discount.toString());
    }
    if (data.measure_interval) {
      formData.append('measure_interval', data.measure_interval.toString());
    }
    if (data.min_weight) {
      formData.append('min_weight', data.min_weight.toString());
    }
    if (data.max_weight) {
      formData.append('max_weight', data.max_weight.toString());
    }
    if (data.image) {
      formData.append('image', data.image);
    }
    if (hasExtras && extras.length > 0) {
      extras.forEach((extra, index) => {
        formData.append(`catalog_item_extras_attributes[${index}][name]`, extra.name);
        formData.append(`catalog_item_extras_attributes[${index}][price]`, extra.price.toString());
      });
    }
    if (hasPrepareMethods) {
      prepareMethods.forEach((method, index) => {
        formData.append(`catalog_item_prepare_methods_attributes[${index}][name]`, method.name);
      });
    }
    if (hasSteps) {
      steps.forEach((step, index) => {
        formData.append(`catalog_item_steps_attributes[${index}][name]`, step.name);
        step.options.forEach((option, optionIndex) => {
          formData.append(`catalog_item_steps_attributes[${index}][catalog_item_step_options_attributes][${optionIndex}][name]`, option.name);
        });
      });
    }
    createCatalogItem(formData);
    onOpenChange(false);
    form.reset();
    setPreviewImage(null)
    setHasDiscount(false)
    setHasExtras(false)
    setHasPrepareMethods(false)
    setHasSteps(false)
    setSteps([])
    setExtras([])
    setPrepareMethods([])
  };

  const itemType = form.watch('item_type');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xs sm:h-auto max-w-[95vw] sm:max-w-[720px] p-4 sm:p-6 md:p-8 bg-white rounded-sm max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#212121] [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar]:px-2">
        <DialogHeader>
          <DialogTitle className="text-start text-xl md:text-2xl font-bold">
            NOVO ITEM
          </DialogTitle>
          <DialogDescription>
            Adicione um novo item ao seu catálogo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold text-foreground">
                    NOME
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Hamburguer" className="border border-black/30 border-[0.5px] h-12 placeholder:text-gray-400" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold text-foreground">
                    DESCRIÇÃO
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Digite a descrição do item" className="border border-black/30 border-[0.5px] h-12 placeholder:text-gray-400" />
                  </FormControl>
                </FormItem>
              )}
            />

            <hr className="border-black/30 border-[0,1px] my-12 w-full" />

            <div className="flex flex-row gap-4 w-full">
              <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange, ...rest } }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-sm font-bold text-foreground">IMAGEM</FormLabel>
                    <div className="flex flex-col gap-2">
                      {previewImage ? (
                        <div className="flex items-center justify-center flex-col gap-2 w-[200px]">
                          <Image
                            src={previewImage}
                            alt="Preview"
                            width={200}
                            height={200}
                            className="rounded-xs object-cover w-[200px] h-[200px]"
                          />
                          <button
                            type="button"
                            onClick={handleChangeImageClick}
                            className="cursor-pointer w-[200px] text-sm font-semibold h-10 bg-muted-foreground text-white rounded-xs flex items-center justify-center gap-2 hover:bg-muted-foreground/80 transition-colors"
                          >
                            TROCAR
                            <Camera size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex h-12 items-center gap-2 border rounded cursor-pointer hover:bg-gray-100 max-w-48">
                          <div className="w-12 h-full bg-black flex items-center justify-center rounded-l">
                            <Camera size={32} className="text-white" />
                          </div>
                          <span className="font-semibold pl-4">Procurar</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} name={rest.name} ref={rest.ref} />
                        </label>
                      )}
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="catalog_group_id"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full">
                    <FormLabel className="text-sm font-bold text-foreground w-full">
                      GRUPO
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl className="w-full h-12">
                        <SelectTrigger className="border border-black/30 border-[0.5px] h-12">
                          <SelectValue placeholder={isLoading ? "Carregando grupos..." : "Selecione um grupo"} className="w-full p-4 h-12 placeholder:text-gray-400" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading ? (
                          <SelectItem value="loading" disabled>Carregando grupos...</SelectItem>
                        ) : (
                          catalog?.data.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.attributes.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-row gap-4 w-full">
              <FormField
                control={form.control}
                name="item_type"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full">
                    <FormLabel className="text-sm font-bold text-foreground w-full">
                      TIPO DE UNIDADE
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl className="w-1/2 h-12">
                        <SelectTrigger className="border border-black/30 border-[0.5px] h-12">
                          <SelectValue placeholder="Selecione o tipo de unidade" className="placeholder:text-gray-400" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unit">Unidade</SelectItem>
                        <SelectItem value="weight_per_kg">Peso por kg</SelectItem>
                        <SelectItem value="weight_per_g">Peso por g</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {(itemType === 'weight_per_kg' || itemType === 'weight_per_g') && (
              <>
                <FormField
                  control={form.control}
                  name="min_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground">
                        PESO MÍNIMO
                      </FormLabel>
                      <FormControl>
                        <Input 
                          min={0}
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="border border-black/30 border-[0.5px] h-12 placeholder:text-gray-400"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground">
                        PESO MÁXIMO
                      </FormLabel>
                      <FormControl>
                        <Input
                          min={0}
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="border border-black/30 border-[0.5px] h-12 placeholder:text-gray-400"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measure_interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground">
                        INTERVALO DE MEDIDA
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="border border-black/30 border-[0.5px] h-12 placeholder:text-gray-400"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold text-foreground">
                    PREÇO {itemType === 'weight_per_kg' ? 'POR KG' : itemType === 'weight_per_g' ? 'POR GRAMA' : ''}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">R$</span>
                      <Input
                        placeholder="0,00"
                        value={formatPrice(field.value)}
                        onChange={(e) => field.onChange(handlePriceChange(e.target.value))}
                        className="pl-10 h-12 border border-black/30"
                        required
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex flex-col md:flex-row justify-between gap-4 w-full">
              <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 bg-muted/40">
                <FormLabel className="text-sm font-bold text-foreground w-full">
                  PRODUTO COM DESCONTO?
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={hasDiscount}
                    onCheckedChange={handleHasDiscountToggle}
                  />
                </FormControl>
              </FormItem>

              <FormField
                control={form.control}
                name="price_with_discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-foreground">
                      PREÇO COM DESCONTO
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">R$</span>
                        <Input
                          placeholder="0,00"
                          value={formatPrice(field.value as number)}
                          onChange={(e) => field.onChange(handlePriceChange(e.target.value))}
                          className="pl-10 h-12 border border-black/30"
                          disabled={!hasDiscount}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <hr className="border-black/30 border-[0,1px] my-12 w-full" />

            <FormItem className="cursor-pointer flex flex-row items-center justify-between rounded-lg p-4 bg-muted/40">
              <FormLabel className="cursor-pointer text-sm font-bold text-foreground w-full">
                ADICIONAIS?
              </FormLabel>
              <FormControl className="cursor-pointer">
                <Switch
                  checked={hasExtras}
                  onCheckedChange={handleExtrasToggle}
                />
              </FormControl>
            </FormItem>

            {hasExtras && (
              <ItemExtras
                extras={extras}
                onExtraChange={handleExtraChange}
                onRemoveExtra={handleRemoveExtra}
                onAddExtra={handleAddExtra}
              />
            )}

            <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 bg-muted/40">
              <FormLabel className="cursor-pointer text-sm font-bold text-foreground w-full">
                MODO DE PREPARO?
              </FormLabel>
              <FormControl className="cursor-pointer">
                <Switch
                  checked={hasPrepareMethods}
                  onCheckedChange={handlePrepareMethodsToggle}
                />
              </FormControl>
            </FormItem>

            {hasPrepareMethods && (
              <ItemPrepareMethods
                prepareMethods={prepareMethods}
                onPrepareMethodChange={handlePrepareMethodChange}
                onRemovePrepareMethod={handleRemovePrepareMethod}
                onAddPrepareMethod={handleAddPrepareMethod}
              />
            )}

            <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 bg-muted/40">
              <FormLabel className="cursor-pointer text-sm font-bold text-foreground w-full">
                ETAPAS?
              </FormLabel>
              <FormControl className="cursor-pointer">
                <Switch
                  checked={hasSteps}
                  onCheckedChange={handleStepsToggle}
                />
              </FormControl>
            </FormItem>

            {hasSteps && (
              <ItemSteps
                steps={steps}
                onStepChange={handleStepChange}
                onRemoveStep={handleRemoveStep}
                onAddStep={handleAddStep}
                onStepOptionChange={handleStepOptionChange}
                onAddStepOption={handleAddStepOption}
                onRemoveStepOption={handleRemoveStepOption}
              />
            )}

            <Button onClick={form.handleSubmit(onSubmit)} className="w-full" disabled={isCreatingItem}>
              {isCreatingItem ? <Loader2 className="animate-spin" /> : 'CRIAR ITEM'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 