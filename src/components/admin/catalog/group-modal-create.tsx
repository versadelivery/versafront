"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Camera, Info, Loader2, Power } from "lucide-react";
import { Switch } from "@/components/ui/switch";

import { useCatalogGroup } from "@/hooks/useCatalogGroup";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import Image from "next/image";
import { fixImageUrl } from "@/utils/image-url";
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [active, setActive] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setImagePreview(attrs.image_url || null);
      setActive(attrs.active ?? true);

    }
  }, [isOpen, catalogGroup, isEditing]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPriority("1");
    setImageFile(null);
    setImagePreview(null);
    setActive(true);

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

    if (!isEditing && !imageFile && !imagePreview) {
      newErrors.image = "Imagem é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      clearError("image");
    }
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


    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (isEditing && editingGroup) {
      formData.append("id", editingGroup);
      updateCatalogGroup(formData, { onSuccess: handleClose });
    } else {
      createCatalogGroup(formData, { onSuccess: handleClose });
    }
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
            <DialogTitle className="text-lg font-semibold">
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
                    Imagem do Grupo {!isEditing && "*"}
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    onClick={handleSelectImage}
                    disabled={isLoading}
                    className={`w-full h-40 rounded-lg border border-dashed overflow-hidden transition-colors hover:bg-gray-50 ${
                      errors.image ? "border-destructive" : "border-gray-200"
                    }`}
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={fixImageUrl(imagePreview) || imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                        <Camera className="h-8 w-8" />
                        <span className="text-sm">Clique para adicionar</span>
                      </div>
                    )}
                  </button>
                  {errors.image && (
                    <p className="text-xs text-destructive mt-1">{errors.image}</p>
                  )}
                </div>

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
                    placeholder="Ex: Pratos Principais"
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
                          <p>Maior número = aparece primeiro</p>
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
