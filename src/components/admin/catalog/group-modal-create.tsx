"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Info, Loader2, Power } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useCatalogGroup } from "@/hooks/useCatalogGroup";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { useCatalogCategories } from "@/hooks/useCatalogCategories";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GroupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingGroup?: string | null;
}

export default function GroupModal({ isOpen, onOpenChange, editingGroup }: GroupModalProps) {
  const {
    createCatalogGroup,
    isCreatingGroup,
    updateCatalogGroup,
    isUpdatingGroup,
    deleteCatalogGroup,
    isDeletingGroup,
    catalogGroup,
    isLoadingGroup,
  } = useCatalogGroup(editingGroup || undefined);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("1");
  const [active, setActive] = useState(true);
  const [categoryId, setCategoryId] = useState("none");
  const { categories } = useCatalogCategories();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isEditing = !!editingGroup;
  const isLoading = isCreatingGroup || isUpdatingGroup;

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    if (isEditing && catalogGroup) {
      const attrs = catalogGroup.data.attributes;
      setName(attrs.name || "");
      setDescription(attrs.description || "");
      setPriority(attrs.priority?.toString() || "1");
      setActive(attrs.active ?? true);
      setCategoryId(attrs.catalog_category_id?.toString() || "none");

    }
  }, [isOpen, catalogGroup, isEditing]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPriority("1");
    setActive(true);
    setCategoryId("none");

    setErrors({});
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = "Nome é obrigatório";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Mínimo 2 caracteres";
    }

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      newErrors.description = "Descrição é obrigatória";
    } else if (trimmedDescription.length < 5) {
      newErrors.description = "Mínimo 5 caracteres";
    }

    const priorityNumber = parseInt(priority, 10);
    if (!priority || isNaN(priorityNumber) || priorityNumber < 1) {
      newErrors.priority = "Deve ser um número maior que 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePriorityChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setPriority(numericValue);
    clearError("priority");
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("priority", priority || "1");
    formData.append("active", active.toString());
    formData.append("catalog_category_id", categoryId === "none" ? "" : categoryId);


    if (isEditing && editingGroup) {
      formData.append("id", editingGroup);
      updateCatalogGroup(formData);
    } else {
      createCatalogGroup(formData);
    }

    handleClose();
  };

  const handleClose = () => {
    if (isLoading) return;
    resetForm();
    onOpenChange(false);
  };

  const handleConfirmDelete = async () => {
    if (!editingGroup) return;
    deleteCatalogGroup(editingGroup);
    setShowDeleteModal(false);
    handleClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="rounded-lg sm:max-w-[640px] p-0 bg-white max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="font-tomato text-lg font-semibold">
              {isEditing ? "Editar Grupo" : "Novo Grupo"}
            </DialogTitle>
          </DialogHeader>

          {isEditing && isLoadingGroup ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Nome do grupo *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError("name");
                    }}
                    placeholder="Ex: Cortes nobres e churrasco"
                    maxLength={50}
                    disabled={isLoading}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Descrição *
                  </label>
          <Textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      clearError("description");
                    }}
                    placeholder="Digite a descrição do grupo"
                    rows={3}
                    maxLength={200}
                    disabled={isLoading}
                    className={errors.description ? "border-destructive" : ""}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Categoria</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Sem categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={String(category.id)}>{category.attributes.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
                  {errors.description && (
                    <p className="text-xs text-destructive mt-1">{errors.description}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Prioridade *
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-primary">
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Menor número = aparece primeiro</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    value={priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    placeholder="1"
                    maxLength={3}
                    disabled={isLoading}
                    className={errors.priority ? "border-destructive" : ""}
                  />
                  {errors.priority && (
                    <p className="text-xs text-destructive mt-1">{errors.priority}</p>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Power className={`h-4 w-4 ${active ? 'text-green-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">Status do Grupo</p>
                      <p className="text-xs text-muted-foreground">
                        {active ? "O grupo está visível no cardápio" : "O grupo está oculto para clientes"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={active}
                    onCheckedChange={setActive}
                    disabled={isLoading}
                  />
                </div>
              </div>


              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                {isEditing ? (
                  <Button
                    variant="outline"
                    className="flex-1 bg-destructive text-white hover:bg-destructive/90 border-destructive"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isLoading || isDeletingGroup}
                  >
                    {isDeletingGroup ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Deletar grupo"
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isEditing ? (
                    "Salvar"
                  ) : (
                    "Criar"
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeletingGroup}
        type="grupo"
      />
    </>
  );
}
