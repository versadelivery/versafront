"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { groupSchema, GroupFormValues } from "@/app/schemas/group-schema";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "./image-upload";
import { DeleteConfirmation } from "./delete-confirmation";
import { UICatalogGroup } from "@/app/types/catalog";

interface GroupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingGroup: UICatalogGroup | null;
  onSave: (values: GroupFormValues) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function GroupModal({ isOpen, onOpenChange, editingGroup, onSave, onDelete }: GroupModalProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hasRemovedImage, setHasRemovedImage] = useState(false);

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
      priority: 0,
      image: undefined,
      removeImage: false,
    }
  });

  useEffect(() => {
    if (editingGroup) {
      form.reset({
        name: editingGroup.name,
        description: editingGroup.description,
        priority: editingGroup.priority,
        image: undefined,
        removeImage: false,
      });
      setPreviewImage(editingGroup.image || null);
      setHasRemovedImage(false);
    } else {
      form.reset({
        name: '',
        description: '',
        priority: 0,
        image: undefined,
        removeImage: false,
      });
      setPreviewImage(null);
      setHasRemovedImage(false);
    }
  }, [editingGroup, form]);

  const isLoading = form.formState.isSubmitting;

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

  const onSubmit = async (values: GroupFormValues) => {
    try {
      const finalValues = {
        ...values,
        image: values.removeImage ? '' : values.image
      };
      
      await onSave(finalValues);
      onOpenChange(false);
      form.reset();
      setPreviewImage(null);
    } catch (error) {
      toast.error("Erro ao salvar grupo");
    }
  };

  const handleDelete = async () => {
    if (!editingGroup?.id || !onDelete) return;
    
    try {
      await onDelete(editingGroup.id);
      onOpenChange(false);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao deletar grupo");
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
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !isLoading && onOpenChange(open)}>
        <DialogContent className="w-full max-w-[95vw] p-4 sm:p-6 md:p-8 bg-white rounded-sm">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-semibold">
              {editingGroup ? 'Editar grupo' : 'Novo grupo'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editingGroup ? 'Atualize as informações do grupo' : 'Adicione um novo grupo ao seu catálogo'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-foreground">
                      NOME DO GRUPO
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite o nome do grupo"
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
              
              <FormItem>
                <FormLabel className="text-sm font-bold text-foreground block mb-2">
                  IMAGEM DO GRUPO
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
                        placeholder="Digite a descrição do grupo"
                        className="py-4 text-sm placeholder:text-foreground/40"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 mt-4">
                <div className="flex gap-2 w-full sm:w-auto">
                  {editingGroup && onDelete && (
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
                  className="rounded-xs bg-primary hover:bg-primary/80 text-white border-none w-full sm:w-auto"
                  disabled={isLoading}
                  size="lg"
                  type="submit"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingGroup ? 'Salvando...' : 'Criando...'}
                    </span>
                  ) : editingGroup ? 'Salvar' : 'Criar'}
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