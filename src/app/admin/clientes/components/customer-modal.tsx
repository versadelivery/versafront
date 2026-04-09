"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { User, Mail, Phone, Loader2 } from "lucide-react";
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

  const maskPhone = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  useEffect(() => {
    if (isEdit && customer) {
      setFormData({
        name: customer.attributes.name || "",
        email: customer.attributes.email || "",
        cellphone: maskPhone(customer.attributes.cellphone || ""),
      });
    } else {
      setFormData({ name: "", email: "", cellphone: "" });
    }
    setErrors({});
  }, [isEdit, customer, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nome deve ter no mínimo 2 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "E-mail inválido";
    }

    const phoneDigits = formData.cellphone.replace(/\D/g, "");
    if (!phoneDigits) {
      newErrors.cellphone = "Celular é obrigatório";
    } else if (phoneDigits.length < 10) {
      newErrors.cellphone = "Celular deve ter pelo menos 10 dígitos";
    } else if (phoneDigits.length > 11) {
      newErrors.cellphone = "Celular deve ter no máximo 11 dígitos";
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
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        cellphone: formData.cellphone.replace(/\D/g, ""),
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === "cellphone") {
      setFormData((prev) => ({ ...prev, cellphone: maskPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md p-0 rounded-md border-[#E5E2DD] gap-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E2DD] flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#F0EFEB] flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <DialogTitle className="font-tomato text-base font-semibold text-gray-900">
              {isEdit ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isEdit
                ? "Atualize as informações do cliente"
                : "Preencha os dados para cadastrar um novo cliente"}
            </DialogDescription>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 bg-[#FAF9F7] space-y-4">
            {/* Nome */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">
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
                  className={`pl-10 h-10 rounded-md border-[#E5E2DD] bg-white ${
                    errors.name ? "border-red-400 focus:border-red-400" : ""
                  }`}
                />
              </div>
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
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
                  className={`pl-10 h-10 rounded-md border-[#E5E2DD] bg-white ${
                    errors.email ? "border-red-400 focus:border-red-400" : ""
                  }`}
                />
              </div>
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Celular */}
            <div className="space-y-1.5">
              <Label htmlFor="cellphone" className="text-sm font-medium">
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
                  maxLength={15}
                  className={`pl-10 h-10 rounded-md border-[#E5E2DD] bg-white ${
                    errors.cellphone ? "border-red-400 focus:border-red-400" : ""
                  }`}
                />
              </div>
              {errors.cellphone && <p className="text-sm text-red-600">{errors.cellphone}</p>}
            </div>

            {!isEdit && (
              <p className="text-sm text-muted-foreground">
                Uma senha temporária será gerada automaticamente para o cliente.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-[#E5E2DD]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10 rounded-md border border-gray-300 cursor-pointer"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 rounded-md bg-primary hover:bg-primary/90 text-white border border-gray-300 cursor-pointer text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEdit ? "Salvando..." : "Criando..."}
                </>
              ) : isEdit ? (
                "Salvar alteracoes"
              ) : (
                "Criar cliente"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
