"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema, ItemFormValues } from "@/app/schemas/item-schema";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Info, Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "../image-upload";
import { UICatalogGroup, UICatalogItem } from "@/app/types/catalog";
import { DeleteConfirmation } from "@/app/components/ui/delete-confirmation";
import { Switch } from "@/app/components/ui/switch";

interface NewItemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groups?: UICatalogGroup[];
  onSave: (formData: FormData) => Promise<void>;
  editingItem?: UICatalogItem | null;
  onDelete?: (id: string) => Promise<void>;
}

interface Extra {
  name: string;
  price: number;
}

interface PrepareMethod {
  name: string;
}

interface ExtraData {
  id: string;
  type: string;
  attributes: {
    name: string;
    price: string;
  };
}

interface PrepareMethodData {
  id: string;
  type: string;
  attributes: {
    name: string;
  };
}

interface Step {
  name: string;
  options: StepOption[];
}

interface StepOption {
  name: string;
}

export function NewItemModal({ isOpen, onOpenChange, groups = [], onSave, editingItem, onDelete }: NewItemModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hasRemovedImage, setHasRemovedImage] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [hasExtras, setHasExtras] = useState(false);
  const [hasPrepareMethods, setHasPrepareMethods] = useState(false);
  const [hasSteps, setHasSteps] = useState(false);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [prepareMethods, setPrepareMethods] = useState<PrepareMethod[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      catalog_group_id: groups[0]?.id || '',
      price: 0,
      priority: 0,
      item_type: 'unit',
      unit_of_measurement: 'kg',
      min_weight: 0,
      max_weight: 0,
      measure_interval: 0,
      price_with_discount: '',
      image: undefined,
      removeImage: false,
      has_extras: false,
      catalog_item_extras_attributes: [],
      has_prepare_methods: false,
      catalog_item_prepare_methods_attributes: [],
    },
  }) as any;

  const { control, reset, setValue, handleSubmit, watch, formState } = form;

  useEffect(() => {
    if (editingItem) {
      const values = {
        name: editingItem.attributes.name,
        description: editingItem.attributes.description || '',
        catalog_group_id: editingItem.attributes.catalog_group_id,
        price: parseFloat(editingItem.attributes.price || '0'),
        priority: parseInt(editingItem.attributes.priority.toString() || '0'),
        item_type: editingItem.attributes.item_type as 'unit' | 'weight',
        unit_of_measurement: editingItem.attributes.unit_of_measurement as 'kg' | 'g' || 'kg',
        min_weight: parseFloat(editingItem.attributes.min_weight || '0'),
        max_weight: parseFloat(editingItem.attributes.max_weight || '0'),
        measure_interval: parseFloat(editingItem.attributes.measure_interval || '0'),
        price_with_discount: editingItem.attributes.price_with_discount || '',
        image: undefined,
        removeImage: false,
        has_extras: !!editingItem.attributes.extra?.data?.length,
        has_prepare_methods: !!editingItem.attributes.prepare_method?.data?.length,
      };
      
      reset(values);
      setHasDiscount(!!editingItem.attributes.price_with_discount);
      setHasExtras(!!editingItem.attributes.extra?.data?.length);
      setHasPrepareMethods(!!editingItem.attributes.prepare_method?.data?.length);
      
      if (editingItem.attributes.extra?.data?.length) {
        const formattedExtras = editingItem.attributes.extra.data.map((extra: ExtraData) => ({
          name: extra.attributes.name,
          price: parseFloat(extra.attributes.price)
        }));
        setExtras(formattedExtras);
      } else {
        setExtras([]);
      }

      if (editingItem.attributes.prepare_method?.data?.length) {
        setPrepareMethods(editingItem.attributes.prepare_method.data.map((method: PrepareMethodData) => ({
          name: method.attributes.name
        })));
      } else {
        setPrepareMethods([]);
      }

      if (editingItem.attributes.steps?.data?.length) {
        const formattedSteps = editingItem.attributes.steps.data.map((step: any) => ({
          name: step.attributes.name,
          options: step.attributes.options?.data?.map((option: any) => ({
            name: option.attributes.name,
            id: option.id
          })) || []
        }));
        setSteps(formattedSteps);
        setHasSteps(true);
      } else {
        setSteps([]);
        setHasSteps(false);
      }

      setPreviewImage(editingItem.attributes.image_url || null);
      setHasRemovedImage(false);
    } else {
      reset({
        name: '',
        description: '',
        catalog_group_id: groups[0]?.id || '',
        price: 0,
        priority: 0,
        item_type: 'unit',
        unit_of_measurement: 'kg',
        min_weight: 0,
        max_weight: 0,
        measure_interval: 0,
        price_with_discount: '',
        image: undefined,
        removeImage: false,
        has_extras: false,
        has_prepare_methods: false,
      });
      setHasDiscount(false);
      setHasExtras(false);
      setHasPrepareMethods(false);
      setExtras([]);
      setPrepareMethods([]);
      setSteps([]);
      setHasSteps(false);
      setPreviewImage(null);
      setHasRemovedImage(false);
    }
  }, [editingItem, reset, groups]);

  const isLoading = formState.isSubmitting;
  const unitType = watch('item_type');

  const handleImageChange = (file: File) => {
    setValue('image', file, { shouldValidate: true });
    setValue('removeImage', false, { shouldValidate: true });
    setPreviewImage(URL.createObjectURL(file));
    setHasRemovedImage(false);
  };

  const handleRemoveImage = () => {
    setValue('image', undefined, { shouldValidate: true });
    setValue('removeImage', true, { shouldValidate: true });
    setPreviewImage(null);
    setHasRemovedImage(true);
  };

  const handleDiscountChange = (checked: boolean) => {
    setHasDiscount(checked);
    if (!checked) {
      setValue('price_with_discount', '');
    }
  };

  const handleAddExtra = () => {
    const newExtras = [...extras, { name: '', price: 0 }];
    setExtras(newExtras);
  };

  const handleRemoveExtra = (index: number) => {
    const newExtras = extras.filter((_, i) => i !== index);
    setExtras(newExtras);
  };

  const handleExtraChange = (index: number, field: keyof Extra, value: string | number) => {
    const newExtras = [...extras];
    newExtras[index] = { ...newExtras[index], [field]: value };
    setExtras(newExtras);
  };

  const handleAddPrepareMethod = () => {
    const newMethods = [...prepareMethods, { name: '' }];
    setPrepareMethods(newMethods);
  };

  const handleRemovePrepareMethod = (index: number) => {
    const newMethods = prepareMethods.filter((_, i) => i !== index);
    setPrepareMethods(newMethods);
  };

  const handlePrepareMethodChange = (index: number, value: string) => {
    const newMethods = [...prepareMethods];
    newMethods[index] = { ...newMethods[index], name: value };
    setPrepareMethods(newMethods);
  };

  const handleAddStep = () => {
    setSteps([...steps, { name: '', options: [] }]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  const handleStepNameChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], name: value };
    setSteps(newSteps);
  };

  const handleAddStepOption = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].options.push({ name: '' });
    setSteps(newSteps);
  };

  const handleRemoveStepOption = (stepIndex: number, optionIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].options = newSteps[stepIndex].options.filter((_, i) => i !== optionIndex);
    setSteps(newSteps);
  };

  const handleStepOptionChange = (stepIndex: number, optionIndex: number, value: string) => {
    const newSteps = [...steps];
    newSteps[stepIndex].options[optionIndex] = { name: value };
    setSteps(newSteps);
  };

  const onSubmit = async (data: ItemFormValues) => {
    try {
      const formData = new FormData();
      
      // Dados básicos
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('catalog_group_id', data.catalog_group_id);
      formData.append('item_type', data.item_type);
      
      // Tratamento de valores numéricos
      formData.append('price', parseFloat(data.price.toString()).toString());
      formData.append('priority', parseInt(data.priority.toString()).toString());
      
      // Preço com desconto
      if (hasDiscount && data.price_with_discount) {
        formData.append('price_with_discount', parseFloat(data.price_with_discount.toString()).toString());
      }

      // Dados de peso
      if (data.item_type === 'weight') {
        formData.append('unit_of_measurement', data.unit_of_measurement || 'kg');
        if (data.min_weight) formData.append('min_weight', parseFloat(data.min_weight.toString()).toString());
        if (data.max_weight) formData.append('max_weight', parseFloat(data.max_weight.toString()).toString());
        if (data.measure_interval) formData.append('measure_interval', parseFloat(data.measure_interval.toString()).toString());
      }

      // Imagem
      if (data.image) {
        formData.append('image', data.image);
      } else if (data.removeImage) {
        formData.append('remove_image', 'true');
      }

      // Extras
      if (hasExtras && extras.length > 0) {
        extras.forEach((extra, index) => {
          formData.append(`catalog_item_extras_attributes[${index}][name]`, extra.name);
          formData.append(`catalog_item_extras_attributes[${index}][price]`, parseFloat(extra.price.toString()).toString());
        });
      }

      // Métodos de preparo
      if (hasPrepareMethods && prepareMethods.length > 0) {
        prepareMethods.forEach((method, index) => {
          formData.append(`catalog_item_prepare_methods_attributes[${index}][name]`, method.name);
        });
      }

      // Passos
      if (hasSteps && steps.length > 0) {
        steps.forEach((step, index) => {
          formData.append(`catalog_item_steps_attributes[${index}][name]`, step.name);
          step.options.forEach((option, optionIndex) => {
            formData.append(`catalog_item_steps_attributes[${index}][catalog_item_step_options_attributes[${optionIndex}][name]`, option.name);
          });
        });
      }

      // ID para edição
      if (editingItem) {
        formData.append('id', editingItem.id);
      }

      await onSave(formData);
      onOpenChange(false);
      reset();
      setPreviewImage(null);
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      toast.error("Erro ao salvar item");
    }
  };

  const handleDelete = async () => {
    if (!editingItem?.id || !onDelete) return;
    
    try {
      await onDelete(editingItem.id);
      onOpenChange(false);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao deletar item");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isLoading) {
      onOpenChange(open);
      if (!open) {
        reset();
        setPreviewImage(null);
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full h-full sm:h-auto max-w-[95vw] sm:max-w-[800px] p-4 sm:p-6 md:p-8 bg-white rounded-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-semibold">
              {editingItem ? 'Editar item' : 'Novo item'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editingItem ? 'Atualize as informações do item' : 'Adicione um novo item ao seu catálogo'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">INFORMAÇÕES DO PRODUTO</h3>
                
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground">
                        NOME DO ITEM
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite o nome do item"
                          className="py-4 text-sm placeholder:text-foreground/40"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="catalog_group_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground">
                        GRUPO
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="py-4 text-sm">
                            <SelectValue placeholder="Selecione um grupo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {groups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel className="text-sm font-bold text-foreground block mb-2">
                    IMAGEM DO ITEM
                  </FormLabel>
                  <ImageUpload
                    previewImage={previewImage}
                    onImageChange={handleImageChange}
                    onRemoveImage={handleRemoveImage}
                    hasRemovedImage={hasRemovedImage}
                  />
                </FormItem>

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground">
                        DESCRIÇÃO
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite a descrição do item"
                          className="py-4 text-sm placeholder:text-foreground/40"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">DADOS DE PREÇO E UNIDADE</h3>

                <FormField
                  control={control}
                  name="item_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground">
                        TIPO DE UNIDADE
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="py-4 text-sm">
                            <SelectValue placeholder="Selecione o tipo de unidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unit">Unidade</SelectItem>
                          <SelectItem value="weight">Peso</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {unitType === 'weight' && (
                  <>
                    <FormField
                      control={control}
                      name="unit_of_measurement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-foreground">
                            UNIDADE DE PESO
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="py-4 text-sm">
                                <SelectValue placeholder="Selecione a unidade de peso" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="kg">Quilograma (kg)</SelectItem>
                              <SelectItem value="g">Grama (g)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="min_weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-foreground">
                            PESO MÍNIMO
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="Digite o peso mínimo"
                              className="py-4 text-sm"
                              {...field}
                              value={field.value?.toString() || ''}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="max_weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-foreground">
                            PESO MÁXIMO
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="Digite o peso máximo"
                              className="py-4 text-sm"
                              {...field}
                              value={field.value?.toString() || ''}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="measure_interval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-foreground">
                            INTERVALO DE MEDIDA
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="Digite o intervalo de medida"
                              className="py-4 text-sm"
                              {...field}
                              value={field.value?.toString() || ''}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground">
                        PREÇO {unitType === 'weight' ? 'POR KG' : ''}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Digite o preço"
                          className="py-4 text-sm"
                          {...field}
                          value={field.value?.toString() || ''}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="price_with_discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground">
                        PREÇO COM DESCONTO
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Digite o preço com desconto"
                          className="py-4 text-sm"
                          {...field}
                          value={field.value?.toString() || ''}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={!hasDiscount}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">O produto está com desconto?</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={hasDiscount}
                      onCheckedChange={handleDiscountChange}
                    />
                  </FormControl>
                </FormItem>

                <FormField
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 mb-1">
                        <FormLabel className="text-sm font-bold text-foreground">
                          PRIORIDADE
                        </FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 h-4 text-foreground/60" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[200px] text-sm">
                              <p>Ordem de exibição no catálogo</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          min="0" 
                          max="100"
                          className="py-4 text-sm"
                          {...field}
                          value={field.value?.toString() || ''}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">ADICIONAIS E MODOS DE PREPARO</h3>

                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">O produto tem adicionais?</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={hasExtras}
                      onCheckedChange={setHasExtras}
                    />
                  </FormControl>
                </FormItem>

                {hasExtras && (
                  <div className="space-y-3">
                    {extras.map((extra, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Input
                            placeholder="Nome do adicional"
                            value={extra.name}
                            onChange={(e) => handleExtraChange(index, 'name', e.target.value)}
                            className="mb-2"
                          />
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                            <Input
                              type="number"
                              placeholder="Preço"
                              value={extra.price}
                              onChange={(e) => handleExtraChange(index, 'price', parseFloat(e.target.value))}
                              min="0"
                              step="0.01"
                              className="pl-8"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveExtra(index)}
                          className="shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddExtra}
                      className="w-full"
                    >
                      Adicionar novo adicional
                    </Button>
                  </div>
                )}

                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">O produto tem modos de preparo?</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={hasPrepareMethods}
                      onCheckedChange={setHasPrepareMethods}
                    />
                  </FormControl>
                </FormItem>

                {hasPrepareMethods && (
                  <div className="space-y-3">
                    {prepareMethods.map((method, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <Input
                          placeholder="Modo de preparo"
                          value={method.name}
                          onChange={(e) => handlePrepareMethodChange(index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePrepareMethod(index)}
                          className="shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddPrepareMethod}
                      className="w-full"
                    >
                      Adicionar novo modo de preparo
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">ETAPAS DO ITEM</h3>

                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">O item tem etapas?</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={hasSteps}
                      onCheckedChange={setHasSteps}
                    />
                  </FormControl>
                </FormItem>

                {hasSteps && (
                  <div className="space-y-4">
                    {steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex gap-2 items-start">
                          <div className="flex-1 space-y-1">
                            <label className="text-sm font-medium text-gray-700">Nome da etapa</label>
                            <Input
                              placeholder="Ex: Escolha o pão"
                              value={step.name}
                              onChange={(e) => handleStepNameChange(stepIndex, e.target.value)}
                              className="bg-white"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveStep(stepIndex)}
                            className="shrink-0 text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-600">Itens desta etapa</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddStepOption(stepIndex)}
                              className="text-xs"
                            >
                              Adicionar item
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {step.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex gap-2 items-start bg-white p-2 rounded-md border border-gray-100">
                                <Input
                                  placeholder="Ex: Pão Australiano"
                                  value={option.name}
                                  onChange={(e) => handleStepOptionChange(stepIndex, optionIndex, e.target.value)}
                                  className="flex-1 border-0 focus-visible:ring-0 bg-transparent"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveStepOption(stepIndex, optionIndex)}
                                  className="shrink-0 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddStep}
                      className="w-full border-dashed"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nova etapa
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 mt-4">
                <div className="flex gap-2 w-full sm:w-auto">
                  {editingItem && onDelete && (
                    <Button 
                      variant="destructive" 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="rounded-xs gap-2 bg-red-500 hover:bg-red-600 w-full sm:w-auto"
                      disabled={isLoading}
                      size="lg"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Deletar</span>
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => onOpenChange(false)} 
                    className="rounded-xs border-none bg-foreground/10 w-full sm:w-auto"
                    disabled={isLoading}
                    size="lg"
                    type="button"
                  >
                    Cancelar
                  </Button>
                </div>
                
                <Button 
                  type="submit" 
                  className="rounded-xs bg-primary hover:bg-primary/90 w-full sm:w-auto"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingItem ? 'Salvando...' : 'Salvando...'}
                    </>
                  ) : (
                    editingItem ? 'Salvar' : 'Salvar'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isLoading}
        type="Item"
      />
    </>
  );
} 