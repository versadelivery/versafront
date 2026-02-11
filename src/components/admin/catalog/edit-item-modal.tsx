"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";  
import Image from "next/image";
import { Camera, Loader2} from "lucide-react";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { ItemExtras, Extra } from "./item-extras";
import { ItemPrepareMethods, PrepareMethod } from "./item-prepare-methods";
import { ItemSteps } from "./item-steps";
import { useCatalogGroup, useCatalogItem } from "@/hooks/useCatalogGroup";
import { toast } from "sonner";
import { updateCatalogItem } from "@/api/requests/catalog_item/requests";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";

interface EditItemModalProps {
  id: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Step {
  name: string;
  options: StepOption[];
  id?: string;
}

interface StepOption {
  id: string;
  name: string;
}

const itemSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  description: z.string().min(1, { message: 'Descrição é obrigatória' }),
  catalog_group_id: z.string().min(0, { message: 'Grupo é obrigatório' }),
  image: z.any().optional(),
  price: z.number().min(0, { message: 'Preço é obrigatório' }),
  item_type: z.enum(['unit', 'weight_per_kg', 'weight_per_g'], { message: 'Tipo de unidade é obrigatório' }),
  min_weight: z.number().min(0).optional(),
  max_weight: z.number().min(0).optional(),
  measure_interval: z.number().min(0).optional(),
  price_with_discount: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  ncm_code: z.string().optional(),
  highlight: z.boolean().optional(),
  sunday_active: z.boolean().optional(),
  monday_active: z.boolean().optional(),
  tuesday_active: z.boolean().optional(),
  wednesday_active: z.boolean().optional(),
  thursday_active: z.boolean().optional(),
  friday_active: z.boolean().optional(),
  saturday_active: z.boolean().optional(),
  promotion_tag: z.boolean().optional(),
  best_seller_tag: z.boolean().optional(),
  new_tag: z.boolean().optional(),
  available_delivery: z.boolean().optional(),
  available_dine_in: z.boolean().optional(),
  catalog_item_extras_attributes: z.array(
    z.object({ 
      name: z.string().min(1, { message: 'Nome do adicional é obrigatório' }), 
      price: z.number().min(0.01, { message: 'Preço deve ser maior que zero' }),
      id: z.string().optional()
    })
  ).optional(),
  catalog_item_prepare_methods_attributes: z.array(z.object({ name: z.string(), id: z.string().optional() })).optional(),
  catalog_item_steps_attributes: z.array(z.object({ id: z.string().optional(), name: z.string(), catalog_item_step_options_attributes: z.array(z.object({ name: z.string(), id: z.string().optional() })) })).optional(),
});

export function EditItemModal({ id, isOpen, onOpenChange }: EditItemModalProps) {
  const { catalog, isLoading } = useCatalogGroup();
  const { catalogItem, isLoadingCatalogItem, deleteCatalogItem, isDeletingCatalogItem } = useCatalogItem(id);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [hasExtras, setHasExtras] = useState(false);
  const [extras, setExtras] = useState<{ name: string; price: number }[]>([]);
  const [prepareMethods, setPrepareMethods] = useState<{ name: string }[]>([]);
  const [hasPrepareMethods, setHasPrepareMethods] = useState(false);
  const [hasSteps, setHasSteps] = useState(false);
  const [steps, setSteps] = useState<{ name: string; options: { name: string }[] }[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoadingCatalogItem && catalogItem) {
      setIsFullyLoaded(true);
    } else {
      setIsFullyLoaded(false);
    }
  }, [isLoading, isLoadingCatalogItem, catalogItem]);

  const handleDeleteItem = async () => {
    await deleteCatalogItem();
    setIsDeleteConfirmationOpen(false);
    onOpenChange(false);
  }

  const handlePriceChange = (value: string) => {
    const numValue = parseFloat(value.replace(/\D/g, '')) / 100 || 0;
    return numValue;
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
  
  const formatPrice = (price: number | string | undefined | null) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (num == null || (num !== 0 && isNaN(num))) {
      return '0,00';
    }
    return num.toFixed(2).replace('.', ',');
  }
  
  const form = useForm({
    resolver: zodResolver(itemSchema)
  });

  useEffect(() => {
    if (catalogItem) {
      const item = catalogItem.data.attributes;
      setPreviewImage(item.image_url || null);
      setHasDiscount(!!item.price_with_discount);
      
      if (item.extra?.data?.length > 0) {
        setHasExtras(true);
        setExtras(item.extra.data.map(extra => ({
          id: extra.id,
          name: extra.attributes.name,
          price: parseFloat(extra.attributes.price)
        })));
      }
      
      if (item.prepare_method?.data?.length > 0) {
        setHasPrepareMethods(true);
        setPrepareMethods(item.prepare_method.data.map(method => ({
          id: method.id,
          name: method.attributes.name
        })));
      }
      
      if (item.steps?.data?.length > 0) {
        setHasSteps(true);
        setSteps(item.steps.data.map(step => ({
          id: step.id,
          name: step.attributes.name,
          options: step.attributes.options.data.map(option => ({
            id: option.id,
            name: option.attributes.name
          }))
        })));
      }


      const formData = {
        name: item.name,
        description: item.description,
        catalog_group_id: catalogItem.data.attributes.group?.data.id || '',
        price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price),
        price_with_discount: typeof item.price_with_discount === 'string' ? parseFloat(item.price_with_discount) : Number(item.price_with_discount || 0),
        item_type: item.item_type as 'unit' | 'weight_per_kg' | 'weight_per_g',
        min_weight: typeof item.min_weight === 'string' ? parseFloat(item.min_weight) : Number(item.min_weight || 0),
        max_weight: typeof item.max_weight === 'string' ? parseFloat(item.max_weight) : Number(item.max_weight || 0),
        measure_interval: typeof item.measure_interval === 'string' ? parseFloat(item.measure_interval) : Number(item.measure_interval || 0),
        cost: typeof item.cost === 'string' ? parseFloat(item.cost) : Number(item.cost || 0),
        ncm_code: item.ncm_code || '',
        highlight: item.highlight || false,
        sunday_active: item.sunday_active !== undefined ? item.sunday_active : true,
        monday_active: item.monday_active !== undefined ? item.monday_active : true,
        tuesday_active: item.tuesday_active !== undefined ? item.tuesday_active : true,
        wednesday_active: item.wednesday_active !== undefined ? item.wednesday_active : true,
        thursday_active: item.thursday_active !== undefined ? item.thursday_active : true,
        friday_active: item.friday_active !== undefined ? item.friday_active : true,
        saturday_active: item.saturday_active !== undefined ? item.saturday_active : true,
        promotion_tag: item.promotion_tag || false,
        best_seller_tag: item.best_seller_tag || false,
        new_tag: item.new_tag || false,
        available_delivery: item.available_delivery !== undefined ? item.available_delivery : true,
        available_dine_in: item.available_dine_in !== undefined ? item.available_dine_in : true,
      };

      form.reset(formData);
      setInitialData(formData);
    }
  }, [catalogItem, form]);

  useEffect(() => {
    if (!initialData) return;

    const currentData = form.getValues();
    const hasBasicChanges = 
      currentData.name !== initialData.name ||
      currentData.description !== initialData.description ||
      currentData.item_type !== initialData.item_type ||
      currentData.price !== initialData.price ||
      currentData.catalog_group_id !== initialData.catalog_group_id ||
      currentData.price_with_discount !== initialData.price_with_discount ||
      currentData.measure_interval !== initialData.measure_interval ||
      currentData.min_weight !== initialData.min_weight ||
      currentData.max_weight !== initialData.max_weight;

    const hasExtrasChanges = hasExtras && JSON.stringify(extras) !== JSON.stringify(initialData.catalog_item_extras_attributes || []);
    const hasPrepareMethodsChanges = hasPrepareMethods && JSON.stringify(prepareMethods) !== JSON.stringify(initialData.catalog_item_prepare_methods_attributes || []);
    
    const initialSteps = initialData.catalog_item_steps_attributes || [];
    const hasStepsChanges = hasSteps && JSON.stringify(steps) !== JSON.stringify(initialSteps);
    const initialStepsOptions = initialSteps.map((step: any) => step.catalog_item_step_options_attributes) || [];
    const hasStepsOptionsChanges = hasSteps && JSON.stringify(steps.map(step => step.options)) !== JSON.stringify(initialStepsOptions);

    setHasChanges(hasBasicChanges || hasExtrasChanges || hasPrepareMethodsChanges || hasStepsChanges || hasStepsOptionsChanges);
  }, [form.watch(), extras, prepareMethods, steps, hasExtras, hasPrepareMethods, hasSteps, initialData]);

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
      form.setValue('catalog_item_steps_attributes', steps.map(step => ({ 
        ...step, 
        catalog_item_step_options_attributes: step.options.map(option => ({ name: option.name })) 
      })));
    } else {
      form.setValue('catalog_item_steps_attributes', undefined);
    }
  }, [hasExtras, hasPrepareMethods, hasSteps, hasDiscount, extras, prepareMethods, steps, form]);

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
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangeImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        form.setValue('image', file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleDiscountToggle = (checked: boolean) => {
    setHasDiscount(checked);
    if (checked) {
      form.setValue('price_with_discount', form.getValues('price'));
    } else {
      form.setValue('price_with_discount', undefined);
    }
  };
  
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
  };

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

  const onSubmit = async (data: any) => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('id', id);

      if (data.name !== initialData?.name) {
        formData.append('name', data.name);
      }
      if (data.description !== initialData?.description) {
        formData.append('description', data.description);
      }
      if (data.item_type !== initialData?.item_type) {
        formData.append('item_type', data.item_type);
      }
      if (data.price !== initialData?.price) {
        formData.append('price', data.price.toString());
      }
      if (data.catalog_group_id !== initialData?.catalog_group_id) {
        formData.append('catalog_group_id', data.catalog_group_id);
      }

      if (data.price_with_discount !== initialData?.price_with_discount) {
        formData.append('price_with_discount', data.price_with_discount?.toString() || '');
      }
      if (data.measure_interval !== initialData?.measure_interval) {
        formData.append('measure_interval', data.measure_interval?.toString() || '');
      }
      if (data.min_weight !== initialData?.min_weight) {
        formData.append('min_weight', data.min_weight?.toString() || '');
      }
      if (data.max_weight !== initialData?.max_weight) {
        formData.append('max_weight', data.max_weight?.toString() || '');
      }
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }
      
      // Novos campos
      if (data.cost !== initialData?.cost) {
        formData.append('cost', data.cost?.toString() || '');
      }
      if (data.ncm_code !== initialData?.ncm_code) {
        formData.append('ncm_code', data.ncm_code || '');
      }
      if (data.highlight !== initialData?.highlight) {
        formData.append('highlight', data.highlight ? 'true' : 'false');
      }
      if (data.sunday_active !== initialData?.sunday_active) {
        formData.append('sunday_active', data.sunday_active ? 'true' : 'false');
      }
      if (data.monday_active !== initialData?.monday_active) {
        formData.append('monday_active', data.monday_active ? 'true' : 'false');
      }
      if (data.tuesday_active !== initialData?.tuesday_active) {
        formData.append('tuesday_active', data.tuesday_active ? 'true' : 'false');
      }
      if (data.wednesday_active !== initialData?.wednesday_active) {
        formData.append('wednesday_active', data.wednesday_active ? 'true' : 'false');
      }
      if (data.thursday_active !== initialData?.thursday_active) {
        formData.append('thursday_active', data.thursday_active ? 'true' : 'false');
      }
      if (data.friday_active !== initialData?.friday_active) {
        formData.append('friday_active', data.friday_active ? 'true' : 'false');
      }
      if (data.saturday_active !== initialData?.saturday_active) {
        formData.append('saturday_active', data.saturday_active ? 'true' : 'false');
      }
      if (data.promotion_tag !== initialData?.promotion_tag) {
        formData.append('promotion_tag', data.promotion_tag ? 'true' : 'false');
      }
      if (data.best_seller_tag !== initialData?.best_seller_tag) {
        formData.append('best_seller_tag', data.best_seller_tag ? 'true' : 'false');
      }
      if (data.new_tag !== initialData?.new_tag) {
        formData.append('new_tag', data.new_tag ? 'true' : 'false');
      }
      if (data.available_delivery !== initialData?.available_delivery) {
        formData.append('available_delivery', data.available_delivery ? 'true' : 'false');
      }
      if (data.available_dine_in !== initialData?.available_dine_in) {
        formData.append('available_dine_in', data.available_dine_in ? 'true' : 'false');
      }

      await updateCatalogItem(formData);
      toast.success('Item atualizado com sucesso');
      onOpenChange(false);
    } catch {
      toast.error('Erro ao atualizar item');
    } finally {
      setIsUpdating(false);
    }
  };

  const itemType = form.watch('item_type');

  if (!isFullyLoaded) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-xs sm:h-auto max-w-[95vw] sm:max-w-[720px] p-4 sm:p-6 md:p-8 bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xs sm:h-auto max-w-[95vw] sm:max-w-[720px] p-4 sm:p-6 md:p-8 bg-white max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#212121] [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar]:px-2">
        <DialogHeader>
          <DialogTitle className="text-start text-xl md:text-2xl font-bold">
            EDITAR ITEM
          </DialogTitle>
          <DialogDescription>
            Edite as informações do item
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
                    <Input {...field} placeholder="Ex: Hamburguer" className="border-black/30 border-[0.5px] h-12 placeholder:text-gray-400" />
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
                    <Textarea {...field} placeholder="Digite a descrição do item" className="border-black/30 border-[0.5px] h-12 placeholder:text-gray-400" />
                  </FormControl>
                </FormItem>
              )}
            />

            <hr className="border-black/30 border-[0.1px] my-12 w-full" />

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
                        <SelectTrigger className="border-black/30 border-[0.5px] h-12">
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-1/2 h-12">
                        <SelectTrigger className="border-black/30 border-[0.5px] h-12">
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
                          className="border-black/30 border-[0.5px] h-12 placeholder:text-gray-400"
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
                          className="border-black/30 border-[0.5px] h-12 placeholder:text-gray-400"
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
                          className="border-black/30 border-[0.5px] h-12 placeholder:text-gray-400"
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
                        className="pl-10 h-12 border-black/30"
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
                          className="pl-10 h-12 border-black/30"
                          disabled={!hasDiscount}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <hr className="border-black/30 border-[0.1px] my-12 w-full" />

            <FormItem className="cursor-pointer flex flex-row items-center justify-between rounded-lg p-4 bg-muted/40">
              <FormLabel className="cursor-pointer text-sm font-bold text-foreground w-full">
                ADICIONAIS?
              </FormLabel>
              <FormControl className="cursor-pointer">
                <div onClick={(e) => e.preventDefault()}>
                  <Switch
                    checked={hasExtras}
                    onCheckedChange={(checked) => {
                      if (!checked && extras.length > 0) {
                        toast.info("Remova todos os adicionais cadastrados antes de desativar esta seção.");
                        return;
                      }
                      handleExtrasToggle(checked);
                    }}
                  />
                </div>
              </FormControl>
            </FormItem>
            {hasExtras && extras.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Para desativar os adicionais, remova todos os itens cadastrados.
              </p>
            )}

            {hasExtras && (
              <ItemExtras
                extras={extras}
                onExtraChange={handleExtraChange}
                onRemoveExtra={handleRemoveExtra}
                onAddExtra={handleAddExtra}
                itemId={id}
              />
            )}

            <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 bg-muted/40">
              <FormLabel className="cursor-pointer text-sm font-bold text-foreground w-full">
                MODO DE PREPARO?
              </FormLabel>
              <FormControl className="cursor-pointer">
                <div onClick={(e) => e.preventDefault()}>
                  <Switch
                    checked={hasPrepareMethods}
                    onCheckedChange={(checked) => {
                      if (!checked && prepareMethods.length > 0) {
                        toast.info("Remova todos os modos de preparo cadastrados antes de desativar esta seção.");
                        return;
                      }
                      handlePrepareMethodsToggle(checked);
                    }}
                  />
                </div>
              </FormControl>
            </FormItem>
            {hasPrepareMethods && prepareMethods.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Para desativar os modos de preparo, remova todos os itens cadastrados.
              </p>
            )}

            {hasPrepareMethods && (
              <ItemPrepareMethods
                prepareMethods={prepareMethods}
                onPrepareMethodChange={handlePrepareMethodChange}
                onRemovePrepareMethod={handleRemovePrepareMethod}
                onAddPrepareMethod={handleAddPrepareMethod}
                itemId={id}
              />
            )}

            <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 bg-muted/40">
              <FormLabel className="cursor-pointer text-sm font-bold text-foreground w-full">
                ETAPAS?
              </FormLabel>
              <FormControl className="cursor-pointer">
                <div onClick={(e) => e.preventDefault()}>
                  <Switch
                    checked={hasSteps}
                    onCheckedChange={(checked) => {
                      if (!checked && steps.length > 0) {
                        toast.info("Remova todas as etapas e opções cadastradas antes de desativar esta seção.");
                        return;
                      }
                      handleStepsToggle(checked);
                    }}
                  />
                </div>
              </FormControl>
            </FormItem>
            {hasSteps && steps.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Para desativar as etapas, remova todas as etapas e opções cadastradas.
              </p>
            )}

            {hasSteps && (
              <ItemSteps
                steps={steps}
                onStepChange={handleStepChange}
                onRemoveStep={handleRemoveStep}
                onAddStep={handleAddStep}
                onStepOptionChange={handleStepOptionChange}
                onAddStepOption={handleAddStepOption}
                onRemoveStepOption={handleRemoveStepOption}
                id={id}
              />
            )}

            <hr className="border-black/30 my-12 w-full" />

            {/* Seção de Dados Fiscais */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">DADOS FISCAIS E CUSTOS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground">
                        CUSTO DO ITEM (Opcional)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2">R$</span>
                          <Input
                            placeholder="0,00"
                            value={formatPrice(field.value as number)}
                            onChange={(e) => field.onChange(handlePriceChange(e.target.value))}
                            className="pl-10 h-12 border-black/30"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ncm_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground">
                        CÓDIGO NCM (Opcional)
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: 1234.56.78" className="border-black/30 border-[0.5px] h-12 placeholder:text-gray-400" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <hr className="border-black/30 my-12 w-full" />

            {/* Seção de Regras de Exibição */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">REGRAS DE EXIBIÇÃO</h3>
              
              <FormField
                control={form.control}
                name="highlight"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 bg-muted/40">
                    <FormLabel className="cursor-pointer text-sm font-bold text-foreground">
                      DESTAQUE NO CARDÁPIO
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel className="text-sm font-bold text-foreground">DIAS ATIVOS</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <FormField
                    control={form.control}
                    name="sunday_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-normal cursor-pointer">Domingo</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monday_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-normal cursor-pointer">Segunda</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tuesday_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-normal cursor-pointer">Terça</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="wednesday_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-normal cursor-pointer">Quarta</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="thursday_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-normal cursor-pointer">Quinta</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="friday_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-normal cursor-pointer">Sexta</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="saturday_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-normal cursor-pointer">Sábado</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <hr className="border-black/30 my-12 w-full" />

            {/* Seção de Tags Visuais */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">TAGS E SELOS VISUAIS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="promotion_tag"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 bg-muted/40">
                      <FormLabel className="cursor-pointer text-sm font-bold text-foreground">
                        PROMOÇÃO
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="best_seller_tag"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 bg-muted/40">
                      <FormLabel className="cursor-pointer text-sm font-bold text-foreground">
                        MAIS VENDIDO
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="new_tag"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 bg-muted/40">
                      <FormLabel className="cursor-pointer text-sm font-bold text-foreground">
                        NOVIDADE!
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <hr className="border-black/30 my-12 w-full" />

            {/* Seção de Canais de Venda */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">CANAIS DE VENDA</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="available_delivery"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 bg-muted/40">
                      <FormLabel className="cursor-pointer text-sm font-bold text-foreground">
                        DELIVERY / RETIRADA
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="available_dine_in"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 bg-muted/40">
                      <FormLabel className="cursor-pointer text-sm font-bold text-foreground">
                        MESA (CONSUMO LOCAL)
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="flex flex-row justify-end gap-4 mt-8 border-t border-black/30 pt-4">
              <Button type="button" variant="outline" className="w-32 bg-red-500 text-white rounded-xs" onClick={() => handleDeleteItem()} disabled={isDeletingCatalogItem}>
                {isDeletingCatalogItem ? <Loader2 className="animate-spin" /> : 'DELETAR'}
              </Button>
              <Button type="submit" className="w-32 rounded-xs" disabled={isUpdating}>
                {isUpdating ? <Loader2 className="animate-spin" /> : 'ATUALIZAR'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      <DeleteConfirmation
        isOpen={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        onConfirm={handleDeleteItem}
        isLoading={isDeletingCatalogItem}
        type="item"
      />
    </Dialog>
  );
}