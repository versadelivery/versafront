"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Loader2, Trash2 } from "lucide-react";
import { CatalogGroup } from "@/app/types/admin";
import { toast } from "sonner";
import { ImageUpload } from "./image-upload";
import { DeleteConfirmation } from "./delete-confirmation";

interface GroupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingGroup: CatalogGroup | null;
  onSave: (groupData: Omit<CatalogGroup, 'id'> & { imageFile?: File }) => Promise<void>;
  onDelete?: (id: number) => Promise<boolean>;
}

export function GroupModal({ isOpen, onOpenChange, editingGroup, onSave, onDelete }: GroupModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (editingGroup?.image) {
      setPreviewImage(editingGroup.image);
    } else {
      setPreviewImage(null);
    }
    setImageFile(null);
  }, [editingGroup, isOpen]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const name = (document.getElementById('name') as HTMLInputElement).value;
      const description = (document.getElementById('description') as HTMLInputElement).value;
      const priorityInput = (document.getElementById('priority') as HTMLInputElement).value;
      const priority = priorityInput ? parseInt(priorityInput) : 0;

      await onSave({
        name,
        description,
        priority,
        image: previewImage || undefined,
        imageFile: imageFile || undefined
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving group:", error);
      toast.error("Erro ao salvar grupo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingGroup?.id || !onDelete) return;
    
    try {
      setIsLoading(true);
      const success = await onDelete(editingGroup.id);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Erro ao deletar grupo");
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
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
          
          <div className="flex flex-col gap-4">
            <FormField 
              id="name"
              label="NOME DO GRUPO"
              placeholder="Digite o nome do grupo"
              defaultValue={editingGroup?.name || ''}
            />
            
            <div className="grid grid-cols-1 gap-4">
              <PriorityField 
                defaultValue={editingGroup?.priority || 0}
              />
              
              <div>
                <label className="text-sm font-bold text-foreground block mb-2">
                  IMAGEM DO GRUPO
                </label>
                <ImageUpload
                  previewImage={previewImage}
                  onImageChange={(file) => {
                    setImageFile(file);
                    setPreviewImage(URL.createObjectURL(file));
                  }}
                  onRemoveImage={() => {
                    setPreviewImage(null);
                    setImageFile(null);
                  }}
                />
              </div>
            </div>
            
            <FormField 
              id="description"
              label="DESCRIÇÃO"
              placeholder="Digite a descrição do grupo"
              defaultValue={editingGroup?.description || ''}
            />
          </div>
          
          <FormActions
            isLoading={isLoading}
            isEditing={!!editingGroup}
            hasDelete={!!(editingGroup && onDelete)}
            onCancel={() => onOpenChange(false)}
            onSave={handleSave}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isLoading}
      />
    </>
  );
}

// Componentes internos ajustados para mobile
function FormField({ id, label, placeholder, defaultValue }: {
  id: string;
  label: string;
  placeholder: string;
  defaultValue: string;
}) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="text-sm font-bold text-foreground block mb-1">
        {label}
      </label>
      <Input 
        id={id}
        placeholder={placeholder}
        className="py-4 text-sm placeholder:text-foreground/40"
        defaultValue={defaultValue}
      />
    </div>
  );
}

function PriorityField({ defaultValue }: { defaultValue: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-1 mb-1">
        <label htmlFor="priority" className="text-sm font-bold text-foreground">
          PRIORIDADE
        </label>
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
      <Input 
        id="priority" 
        type="number" 
        placeholder="0" 
        min="0" 
        max="100"
        className="py-4 text-sm"
        defaultValue={defaultValue}
      />
    </div>
  );
}

function FormActions({
  isLoading,
  isEditing,
  hasDelete,
  onCancel,
  onSave,
  onDelete
}: {
  isLoading: boolean;
  isEditing: boolean;
  hasDelete: boolean;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 mt-4">
      <div className="flex gap-2 w-full sm:w-auto">
        {hasDelete && (
          <Button 
            variant="destructive" 
            onClick={onDelete}
            className="rounded-xs gap-2 bg-red-500 hover:bg-red-600 w-full sm:w-auto"
            disabled={isLoading}
            size="lg"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Deletar</span>
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={onCancel} 
          className="rounded-xs border-none bg-foreground/10 w-full sm:w-auto"
          disabled={isLoading}
          size="lg"
        >
          Cancelar
        </Button>
      </div>
      
      <Button 
        onClick={onSave}
        className="rounded-xs bg-primary hover:bg-primary/80 text-white border-none w-full sm:w-auto"
        disabled={isLoading}
        size="lg"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isEditing ? 'Salvando...' : 'Criando...'}
          </span>
        ) : isEditing ? 'Salvar' : 'Criar'}
      </Button>
    </div>
  );
}