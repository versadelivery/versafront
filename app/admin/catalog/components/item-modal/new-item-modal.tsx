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
import { Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "../image-upload";
import { UICatalogGroup } from "@/app/types/catalog";

interface NewItemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groups?: UICatalogGroup[];
  onSave: (formData: FormData) => Promise<void>;
}

export function NewItemModal({ isOpen, onOpenChange, groups = [], onSave }: NewItemModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hasRemovedImage, setHasRemovedImage] = useState(false);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      description: '',
      groupId: groups[0]?.id || '',
      price: 0,
      priority: 0,
      unitType: 'unit',
      weightUnit: 'kg',
      weightPerKg: 0,
      minWeight: 0,
      maxWeight: 0,
      weightInterval: 0,
      image: undefined,
      removeImage: false,
    }
  });

  useEffect(() => {
    if (groups.length > 0 && !form.getValues('groupId')) {
      form.setValue('groupId', groups[0].id);
    }
  }, [groups, form]);

  const isLoading = form.formState.isSubmitting;
  const unitType = form.watch('unitType');

  const handleImageChange = (file: File) => {
    form.setValue('image', file, { shouldValidate: true });
    form.setValue('removeImage', false, { shouldValidate: true });
    setPreviewImage(URL.createObjectURL(file));
    setHasRemovedImage(false);
  };

  const handleRemoveImage = () => {
    form.setValue('image', undefined, { shouldValidate: true });
    form.setValue('removeImage', true, { shouldValidate: true });
    setPreviewImage(null);
    setHasRemovedImage(true);
  };

  const onSubmit = async (values: ItemFormValues) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      formData.append('catalog_group_id', values.groupId);
      formData.append('price', values.price.toString());
      formData.append('priority', values.priority.toString());
      formData.append('item_type', values.unitType);

      if (values.unitType === 'weight') {
        formData.append('unit_of_measurement', values.weightUnit || 'kg');
        formData.append('measure_interval', (values.weightInterval || 0).toString());
        formData.append('min_weight', (values.minWeight || 0).toString());
        formData.append('max_weight', (values.maxWeight || 0).toString());
      }

      if (values.removeImage) {
        formData.append('image', '');
      } else if (values.image) {
        formData.append('image', values.image);
      }

      console.log('FormData:', Object.fromEntries(formData.entries()));

      await onSave(formData);
      onOpenChange(false);
      form.reset();
      setPreviewImage(null);
    } catch (error) {
      toast.error("Erro ao salvar item");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isLoading) {
      onOpenChange(open);
      if (!open) {
        form.reset();
        setPreviewImage(null);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full h-full sm:h-auto max-w-[95vw] sm:max-w-[800px] p-4 sm:p-6 md:p-8 bg-white rounded-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-semibold">
            Novo Item
          </DialogTitle>
          <DialogDescription className="text-sm">
            Adicione um novo item ao seu catálogo
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">INFORMAÇÕES DO PRODUTO</h3>
              
              <FormField
                control={form.control}
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
                control={form.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-foreground">
                      GRUPO
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                control={form.control}
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
                control={form.control}
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
                    control={form.control}
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
                    control={form.control}
                    name="weightPerKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-foreground">
                          PESO POR KG
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Digite o peso por kg"
                            className="py-4 text-sm"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
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
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
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
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
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
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
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
                      PREÇO
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
                control={form.control}
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
              
              <Button 
                type="submit" 
                className="rounded-xs bg-primary hover:bg-primary/90 w-full sm:w-auto"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 