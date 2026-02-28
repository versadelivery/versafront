"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X, User, Mail, Phone, Loader2 } from "lucide-react";
import { Customer } from "../services/customerService";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  customer?: Customer | null;
  isEdit?: boolean;
}

export default function CustomerModal({
  isOpen,
  onClose,
  onSave,
  customer,
  isEdit = false,
}: CustomerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cellphone: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && customer) {
      setFormData({
        name: customer.attributes.name || "",
        email: customer.attributes.email || "",
        cellphone: customer.attributes.cellphone || "",
      });
    } else {
      setFormData({ name: "", email: "", cellphone: "" });
    }
    setErrors({});
  }, [isEdit, customer, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.cellphone.trim()) {
      newErrors.cellphone = "Celular é obrigatório";
    } else if (formData.cellphone.replace(/\D/g, "").length < 10) {
      newErrors.cellphone = "Celular deve ter pelo menos 10 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: formData.name,
        email: formData.email,
        cellphone: formData.cellphone,
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {isEdit ? "Editar Cliente" : "Novo Cliente"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isEdit
                    ? "Atualize as informações do cliente"
                    : "Preencha os dados para cadastrar um novo cliente"}
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

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Nome completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: João Silva"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`pl-10 h-11 ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@exemplo.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`pl-10 h-11 ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Celular */}
            <div className="space-y-2">
              <Label htmlFor="cellphone" className="text-sm font-medium text-foreground">
                Celular
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="cellphone"
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={formData.cellphone}
                  onChange={(e) => handleChange("cellphone", e.target.value)}
                  className={`pl-10 h-11 ${errors.cellphone ? "border-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              {errors.cellphone && <p className="text-xs text-red-500">{errors.cellphone}</p>}
            </div>

            {!isEdit && (
              <p className="text-xs text-muted-foreground">
                Uma senha temporária será gerada automaticamente para o cliente.
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
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
                className="flex-1 h-11 bg-violet-600 hover:bg-violet-700 text-white"
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
                  "Criar cliente"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
