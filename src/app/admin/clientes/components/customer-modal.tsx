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
import { MapPin } from "lucide-react";
import { AddressNumberField } from "@/components/address-number-field";
import { normalizeAddressNumber, splitStreetNumber } from "@/utils/address-number";
import { Customer } from "../services/customerService";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  customer?: Customer | null;
  isEdit?: boolean;
}

const emptyAddress = { id: undefined as number | undefined, address: "", number: "", neighborhood: "", complement: "", reference: "" };

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
  // Endereço opcional (mesmos campos do checkout/PDV); id existe quando edita o endereço padrão salvo
  const [addr, setAddr] = useState(emptyAddress);

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
      const saved = customer.attributes.default_address;
      if (saved) {
        const { street, number } = splitStreetNumber(saved.address, saved.number);
        setAddr({ id: saved.id, address: street, number, neighborhood: saved.neighborhood ?? "", complement: saved.complement ?? "", reference: saved.reference ?? "" });
      } else {
        setAddr(emptyAddress);
      }
    } else {
      setFormData({ name: "", email: "", cellphone: "" });
      setAddr(emptyAddress);
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

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "E-mail inválido";
    }

    // endereço é opcional, mas se preencheu algo precisa da rua
    const hasAddr = [addr.address, addr.number, addr.neighborhood, addr.complement, addr.reference].some((v) => v.trim());
    if (hasAddr && !addr.address.trim()) newErrors.address = "Informe a rua para salvar o endereço";

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
        ...(addr.address.trim() && {
          address: {
            ...(addr.id && { id: addr.id }),
            address: addr.address.trim(),
            number: normalizeAddressNumber(addr.number),
            neighborhood: addr.neighborhood.trim(),
            complement: addr.complement.trim(),
            reference: addr.reference.trim(),
          },
        }),
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
      <DialogContent className="sm:max-w-lg w-[calc(100vw-1rem)] max-h-[92dvh] flex flex-col overflow-hidden p-0 rounded-md border-[#E5E2DD] gap-0">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#E5E2DD] flex items-center gap-3 shrink-0">
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
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-[#FAF9F7] space-y-4">
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

            {/* Endereço (opcional) */}
            <div className="space-y-3 border-t border-[#E5E2DD] pt-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-gray-900">Endereço</span>
                <span className="text-xs text-muted-foreground">(opcional)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address" className="text-sm font-medium">Rua</Label>
                  <Input
                    id="address"
                    value={addr.address}
                    onChange={(e) => { setAddr((p) => ({ ...p, address: e.target.value })); if (errors.address) setErrors((p) => ({ ...p, address: "" })); }}
                    placeholder="Nome da rua"
                    maxLength={70}
                    className={`h-10 rounded-md border-[#E5E2DD] bg-white ${errors.address ? "border-red-400 focus:border-red-400" : ""}`}
                  />
                  {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="number" className="text-sm font-medium">Número</Label>
                  <AddressNumberField id="number" value={addr.number} onChange={(number) => setAddr((p) => ({ ...p, number }))} className="h-10 border-[#E5E2DD] bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="neighborhood" className="text-sm font-medium">Bairro/Condomínio</Label>
                  <Input id="neighborhood" value={addr.neighborhood} onChange={(e) => setAddr((p) => ({ ...p, neighborhood: e.target.value }))} placeholder="Bairro" className="h-10 rounded-md border-[#E5E2DD] bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="complement" className="text-sm font-medium">Complemento</Label>
                  <Input id="complement" value={addr.complement} onChange={(e) => setAddr((p) => ({ ...p, complement: e.target.value }))} placeholder="Apt, bloco" className="h-10 rounded-md border-[#E5E2DD] bg-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reference" className="text-sm font-medium">Referência</Label>
                <Input id="reference" value={addr.reference} onChange={(e) => setAddr((p) => ({ ...p, reference: e.target.value }))} placeholder="Ponto de referência" className="h-10 rounded-md border-[#E5E2DD] bg-white" />
              </div>
            </div>

            {!isEdit && (
              <p className="text-sm text-muted-foreground">
                Uma senha temporária será gerada automaticamente para o cliente.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-4 sm:px-6 py-4 border-t border-[#E5E2DD] shrink-0">
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
