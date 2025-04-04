"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema, ItemFormValues } from "@/app/schemas/item-schema";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "../image-upload";
import { UICatalogGroup, UICatalogItem } from "@/app/types/catalog";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { Switch } from "@/components/ui/switch";

interface NewItemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groups?: UICatalogGroup[];
  onSave: (formData: FormData) => Promise<void>;
  editingItem?: UICatalogItem | null;
  onDelete?: (id: string) => Promise<void>;
}

export function NewItemModal({ isOpen, onOpenChange, groups = [], onSave, editingItem, onDelete }: NewItemModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hasRemovedImage, setHasRemovedImage] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      groupId: groups[0]?.id || '',
      price: 0,
      priority: 0,
      unitType: 'unit',
      weightUnit: 'kg',
      minWeight: 0,
      maxWeight: 0,
      weightInterval: 0,
      price_with_discount: '',
      image: undefined,
      removeImage: false,
    },
  }) as any;

  const { control, reset, setValue, handleSubmit, watch, formState } = form;

  useEffect(() => {
    if (editingItem) {
      const values = {
        name: editingItem.attributes.name,
        description: editingItem.attributes.description || '',
        groupId: editingItem.attributes.catalog_group_id,
        price: parseFloat(editingItem.attributes.price || '0'),
        priority: parseInt(editingItem.attributes.priority || '0'),
        unitType: editingItem.attributes.item_type as 'unit' | 'weight',
        weightUnit: editingItem.attributes.unit_of_measurement as 'kg' | 'g' || 'kg',
        minWeight: parseFloat(editingItem.attributes.min_weight || '0'),
        maxWeight: parseFloat(editingItem.attributes.max_weight || '0'),
        weightInterval: parseFloat(editingItem.attributes.measure_interval || '0'),
        price_with_discount: editingItem.attributes.price_with_discount || '',
        image: undefined,
        removeImage: false,
      };
      
      reset(values);
      setHasDiscount(!!editingItem.attributes.price_with_discount);
      setPreviewImage(editingItem.attributes.image_url || null);
      setHasRemovedImage(false);
    } else {
      reset({
        name: '',
        description: '',
        groupId: groups[0]?.id || '',
        price: 0,
        priority: 0,
        unitType: 'unit',
        weightUnit: 'kg',
        minWeight: 0,
        maxWeight: 0,
        weightInterval: 0,
        price_with_discount: '',
        image: undefined,
        removeImage: false,
      });
      setHasDiscount(false);
      setPreviewImage(null);
      setHasRemovedImage(false);
    }
  }, [editingItem, reset, groups]);

  const isLoading = formState.isSubmitting;
  const unitType = watch('unitType');

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

  const onSubmit = async (data: ItemFormValues) => {
    try {
      const formData = new FormData();
      
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('catalog_group_id', data.groupId);
      formData.append('price', data.price.toString());
      formData.append('priority', data.priority.toString());
      formData.append('item_type', data.unitType);
      
      formData.append('price_with_discount', hasDiscount ? (data.price_with_discount || '') : '');
  
      if (data.unitType === 'weight') {
        formData.append('unit_of_measurement', data.weightUnit || '');
        formData.append('min_weight', data.minWeight?.toString() || '');
        formData.append('max_weight', data.maxWeight?.toString() || '');
        formData.append('measure_interval', data.weightInterval?.toString() || '');
      }
  
      if (data.image) {
        formData.append('image', data.image);
      }
      if (data.removeImage) {
        formData.append('remove_image', 'true');
      }
  
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
                  name="groupId"
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
                  name="unitType"
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
                      name="weightUnit"
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
                      name="minWeight"
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
                      name="maxWeight"
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
                      name="weightInterval"
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