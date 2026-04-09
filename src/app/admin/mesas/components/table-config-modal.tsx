"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, UtensilsCrossed, Loader2 } from "lucide-react";
import { Table, CreateTablePayload, UpdateTablePayload } from "../services/table-service";

interface TableConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTablePayload | UpdateTablePayload) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  table?: Table | null;
  isEdit?: boolean;
}

export default function TableConfigModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  table,
  isEdit = false,
}: TableConfigModalProps) {
  const [formData, setFormData] = useState({
    number: "",
    label: "",
    capacity: "4",
    shape: "square" as "square" | "round" | "rectangle",
    active: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isEdit && table) {
      const attrs = table.attributes;
      setFormData({
        number: attrs.number.toString(),
        label: attrs.label || "",
        capacity: attrs.capacity.toString(),
        shape: attrs.shape,
        active: attrs.active,
      });
    } else {
      setFormData({
        number: "",
        label: "",
        capacity: "4",
        shape: "square",
        active: true,
      });
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [isEdit, table, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.number || Number(formData.number) <= 0) {
      newErrors.number = "Número da mesa deve ser maior que zero";
    }

    if (!formData.capacity || Number(formData.capacity) <= 0) {
      newErrors.capacity = "Capacidade deve ser maior que zero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        number: Number(formData.number),
        label: formData.label || undefined,
        capacity: Number(formData.capacity),
        shape: formData.shape,
        active: formData.active,
      };

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar mesa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!table || !onDelete) return;

    setIsSubmitting(true);
    try {
      await onDelete(table.id);
      onClose();
    } catch (error) {
      console.error("Erro ao deletar mesa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleIntegerInput = (field: string, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    handleChange(field, cleaned);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-tomato text-xl font-semibold text-foreground">
                  {isEdit ? "Editar Mesa" : "Nova Mesa"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isEdit ? "Atualize as informações da mesa" : "Configure uma nova mesa"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {showDeleteConfirm ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-tomato text-lg font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tem certeza que deseja excluir a <strong>Mesa {table?.attributes.number}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-11"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    "Confirmar Exclusão"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="number" className="text-sm font-medium text-foreground">
                  Número da mesa
                </Label>
                <Input
                  id="number"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex: 1"
                  value={formData.number}
                  onChange={(e) => handleIntegerInput("number", e.target.value)}
                  className={`h-11 ${errors.number ? "border-red-500" : ""}`}
                />
                {errors.number && <p className="text-xs text-red-500">{errors.number}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="label" className="text-sm font-medium text-foreground">
                  Rótulo (opcional)
                </Label>
                <Input
                  id="label"
                  type="text"
                  placeholder="Ex: Mesa VIP"
                  value={formData.label}
                  onChange={(e) => handleChange("label", e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-sm font-medium text-foreground">
                  Capacidade (lugares)
                </Label>
                <Input
                  id="capacity"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex: 4"
                  value={formData.capacity}
                  onChange={(e) => handleIntegerInput("capacity", e.target.value)}
                  className={`h-11 ${errors.capacity ? "border-red-500" : ""}`}
                />
                {errors.capacity && <p className="text-xs text-red-500">{errors.capacity}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Formato</Label>
                <Select
                  value={formData.shape}
                  onValueChange={(value) => handleChange("shape", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Quadrada</SelectItem>
                    <SelectItem value="round">Redonda</SelectItem>
                    <SelectItem value="rectangle">Retangular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">Mesa ativa</Label>
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => handleChange("active", checked)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                {isEdit && onDelete && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    disabled={isSubmitting}
                  >
                    Excluir
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-11"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEdit ? "Salvando..." : "Criando..."}
                    </>
                  ) : isEdit ? (
                    "Salvar alterações"
                  ) : (
                    "Criar mesa"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
