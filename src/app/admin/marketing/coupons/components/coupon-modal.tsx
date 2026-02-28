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
import { X, Ticket, Loader2 } from "lucide-react";
import { Coupon, CreateCouponPayload, UpdateCouponPayload } from "../services/coupon-service";

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCouponPayload | UpdateCouponPayload) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  coupon?: Coupon | null;
  isEdit?: boolean;
}

export default function CouponModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  coupon,
  isEdit = false,
}: CouponModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "fixed_value" as "fixed_value" | "percentage",
    value: "",
    minimum_order_value: "",
    usage_limit: "",
    unlimited: true,
    starts_at: "",
    expires_at: "",
    active: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isEdit && coupon) {
      const attrs = coupon.attributes;
      setFormData({
        code: attrs.code || "",
        discount_type: attrs.discount_type || "fixed_value",
        value: attrs.value || "",
        minimum_order_value: attrs.minimum_order_value || "0",
        usage_limit: attrs.usage_limit?.toString() || "",
        unlimited: attrs.usage_limit === null,
        starts_at: attrs.starts_at ? formatDatetimeLocal(attrs.starts_at) : "",
        expires_at: attrs.expires_at ? formatDatetimeLocal(attrs.expires_at) : "",
        active: attrs.active,
      });
    } else {
      setFormData({
        code: "",
        discount_type: "fixed_value",
        value: "",
        minimum_order_value: "",
        usage_limit: "",
        unlimited: true,
        starts_at: "",
        expires_at: "",
        active: true,
      });
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [isEdit, coupon, isOpen]);

  if (!isOpen) return null;

  function formatDatetimeLocal(isoString: string): string {
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.code.trim()) {
      newErrors.code = "Código é obrigatório";
    }

    if (!formData.value || Number(formData.value) <= 0) {
      newErrors.value = "Valor deve ser maior que zero";
    }

    if (formData.discount_type === "percentage" && Number(formData.value) > 100) {
      newErrors.value = "Percentual não pode ser maior que 100";
    }

    if (formData.minimum_order_value && Number(formData.minimum_order_value) < 0) {
      newErrors.minimum_order_value = "Valor mínimo não pode ser negativo";
    }

    if (!formData.unlimited && formData.usage_limit) {
      if (Number(formData.usage_limit) <= 0 || !Number.isInteger(Number(formData.usage_limit))) {
        newErrors.usage_limit = "Limite deve ser um número inteiro positivo";
      }
    }

    if (formData.starts_at && formData.expires_at) {
      if (new Date(formData.expires_at) <= new Date(formData.starts_at)) {
        newErrors.expires_at = "Data de fim deve ser posterior à data de início";
      }
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
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discount_type,
        value: Number(formData.value),
        minimum_order_value: Number(formData.minimum_order_value) || 0,
        usage_limit: formData.unlimited ? null : Number(formData.usage_limit) || null,
        starts_at: formData.starts_at || null,
        expires_at: formData.expires_at || null,
        active: formData.active,
      };

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cupom:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!coupon || !onDelete) return;

    setIsSubmitting(true);
    try {
      await onDelete(coupon.id);
      onClose();
    } catch (error) {
      console.error("Erro ao deletar cupom:", error);
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

  const handleCurrencyInput = (field: string, raw: string) => {
    // Remove tudo exceto dígitos e vírgula/ponto
    const cleaned = raw.replace(/[^\d,]/g, "");
    // Troca vírgula por ponto internamente
    const normalized = cleaned.replace(",", ".");
    // Permite no máximo 2 casas decimais
    const parts = normalized.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    handleChange(field, normalized);
  };

  const formatCurrencyDisplay = (value: string) => {
    if (!value) return "";
    return value.replace(".", ",");
  };

  const handlePercentageInput = (raw: string) => {
    const cleaned = raw.replace(/[^\d,]/g, "");
    const normalized = cleaned.replace(",", ".");
    const parts = normalized.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    const num = parseFloat(normalized);
    if (num > 100) return;
    handleChange("value", normalized);
  };

  const handleIntegerInput = (field: string, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    handleChange(field, cleaned);
  };

  const handleCodeInput = (raw: string) => {
    // Apenas letras, números, hífen e underscore
    const cleaned = raw.replace(/[^A-Za-z0-9_-]/g, "").toUpperCase();
    handleChange("code", cleaned);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {isEdit ? "Editar Cupom" : "Novo Cupom"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isEdit ? "Atualize as informações do cupom" : "Preencha os dados do cupom"}
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
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tem certeza que deseja excluir o cupom <strong>{coupon?.attributes.code}</strong>?
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
              {/* Código */}
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-foreground">
                  Código do cupom
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Ex: PROMO10"
                  maxLength={30}
                  value={formData.code}
                  onChange={(e) => handleCodeInput(e.target.value)}
                  className={`h-11 uppercase font-mono tracking-wider ${errors.code ? "border-red-500" : ""}`}
                />
                {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
              </div>

              {/* Tipo de desconto */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Tipo de desconto</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) => {
                    handleChange("discount_type", value);
                    // Limpa valor ao trocar tipo para evitar inconsistências (ex: 200 em percentual)
                    if (value === "percentage" && Number(formData.value) > 100) {
                      handleChange("value", "");
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={`h-11`}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed_value">Valor Fixo (R$)</SelectItem>
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="value" className="text-sm font-medium text-foreground">
                  {formData.discount_type === "percentage" ? "Percentual" : "Valor do desconto"}
                </Label>
                <div className="relative">
                  {formData.discount_type === "fixed_value" && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">R$</span>
                  )}
                  <Input
                    id="value"
                    type="text"
                    inputMode="decimal"
                    placeholder={formData.discount_type === "percentage" ? "Ex: 15" : "Ex: 10,00"}
                    value={formatCurrencyDisplay(formData.value)}
                    onChange={(e) =>
                      formData.discount_type === "percentage"
                        ? handlePercentageInput(e.target.value)
                        : handleCurrencyInput("value", e.target.value)
                    }
                    className={`h-11 ${formData.discount_type === "fixed_value" ? "pl-10" : "pr-10"} ${errors.value ? "border-red-500" : ""}`}
                  />
                  {formData.discount_type === "percentage" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">%</span>
                  )}
                </div>
                {errors.value && <p className="text-xs text-red-500">{errors.value}</p>}
              </div>

              {/* Valor mínimo do pedido */}
              <div className="space-y-2">
                <Label htmlFor="minimum_order_value" className="text-sm font-medium text-foreground">
                  Valor mínimo do pedido
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">R$</span>
                  <Input
                    id="minimum_order_value"
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex: 50,00"
                    value={formatCurrencyDisplay(formData.minimum_order_value)}
                    onChange={(e) => handleCurrencyInput("minimum_order_value", e.target.value)}
                    className={`h-11 pl-10 ${errors.minimum_order_value ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.minimum_order_value && (
                  <p className="text-xs text-red-500">{errors.minimum_order_value}</p>
                )}
              </div>

              {/* Limite de uso */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Limite de uso</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 100"
                    value={formData.usage_limit}
                    onChange={(e) => handleIntegerInput("usage_limit", e.target.value)}
                    className={`h-11 flex-1 ${errors.usage_limit ? "border-red-500" : ""}`}
                    disabled={formData.unlimited}
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.unlimited}
                      onCheckedChange={(checked) => {
                        handleChange("unlimited", checked);
                        if (checked) handleChange("usage_limit", "");
                      }}
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Ilimitado</span>
                  </div>
                </div>
                {errors.usage_limit && <p className="text-xs text-red-500">{errors.usage_limit}</p>}
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="starts_at" className="text-sm font-medium text-foreground">
                    Início da validade
                  </Label>
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => handleChange("starts_at", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires_at" className="text-sm font-medium text-foreground">
                    Fim da validade
                  </Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => handleChange("expires_at", e.target.value)}
                    className={`h-11 ${errors.expires_at ? "border-red-500" : ""}`}
                  />
                  {errors.expires_at && <p className="text-xs text-red-500">{errors.expires_at}</p>}
                </div>
              </div>

              {/* Ativo */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">Cupom ativo</Label>
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => handleChange("active", checked)}
                />
              </div>

              {/* Buttons */}
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
                    "Criar cupom"
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
