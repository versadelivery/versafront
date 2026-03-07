"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, UtensilsCrossed, Loader2, Clock, Users, ShoppingCart, DollarSign, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableSession, CloseTableSessionPayload } from "../services/table-service";
import { getPaymentMethods } from "@/app/admin/settings/payment/payment-service";

interface CloseTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: CloseTableSessionPayload) => Promise<void>;
  table: Table | null;
  session: TableSession | null;
}

export default function CloseTableModal({
  isOpen,
  onClose,
  onSubmit,
  table,
  session,
}: CloseTableModalProps) {
  const [formData, setFormData] = useState({
    total_amount: "",
    notes: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: paymentConfig } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: getPaymentMethods,
    enabled: isOpen,
  });

  if (!isOpen || !table || !session) return null;

  const sessionAttrs = session.attributes;
  const hasOrders = sessionAttrs.orders && sessionAttrs.orders.length > 0;

  const serviceFeeEnabled = paymentConfig?.data?.attributes?.service_fee_enabled ?? false;
  const serviceFeePercentage = Number(paymentConfig?.data?.attributes?.service_fee_percentage ?? 0);
  const subtotal = hasOrders ? Number(sessionAttrs.orders_total) : Number(formData.total_amount || 0);
  const serviceFeeAmount = serviceFeeEnabled ? (subtotal * serviceFeePercentage / 100) : 0;
  const totalWithFee = subtotal + serviceFeeAmount;

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      Number(value)
    );
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      received: "Recebido",
      accepted: "Aceito",
      in_preparation: "Preparando",
      ready: "Pronto",
      delivered: "Entregue",
    };
    return map[status] || status;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}min`;
    return `${mins}min`;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!hasOrders && (!formData.total_amount || Number(formData.total_amount) < 0)) {
      newErrors.total_amount = "Informe o valor total";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(session.id, {
        total_amount: hasOrders ? Number(sessionAttrs.orders_total) : Number(formData.total_amount),
        notes: formData.notes || undefined,
      });
      setFormData({ total_amount: "", notes: "" });
      onClose();
    } catch (error) {
      console.error("Erro ao fechar comanda:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCurrencyInput = (raw: string) => {
    const cleaned = raw.replace(/[^\d,]/g, "");
    const normalized = cleaned.replace(",", ".");
    const parts = normalized.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setFormData((prev) => ({ ...prev, total_amount: normalized }));
    if (errors.total_amount) {
      setErrors((prev) => ({ ...prev, total_amount: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-md border border-[#E5E2DD]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border border-red-400 rounded-md flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-tomato text-xl font-semibold text-foreground">
                  Fechar Comanda
                </h2>
                <p className="text-sm text-muted-foreground">
                  Mesa {table.attributes.number}
                  {table.attributes.label ? ` - ${table.attributes.label}` : ""}
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

          <div className="bg-[#FAF9F7] rounded-md border border-[#E5E2DD] p-4 mb-6 space-y-2">
            {sessionAttrs.customer_name && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">{sessionAttrs.customer_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Pessoas:</span>
              <span className="font-medium">{sessionAttrs.customer_count}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tempo:</span>
              <span className="font-medium">{formatDuration(sessionAttrs.duration_minutes)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground ml-6">Aberto por:</span>
              <span className="font-medium">{sessionAttrs.opened_by_name}</span>
            </div>
            {sessionAttrs.notes && (
              <div className="text-sm mt-2">
                <span className="text-muted-foreground">Obs:</span>{" "}
                <span>{sessionAttrs.notes}</span>
              </div>
            )}
          </div>

          {/* Pedidos vinculados */}
          {hasOrders && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Pedidos ({sessionAttrs.orders.length})
                </span>
              </div>
              <div className="bg-[#FAF9F7] rounded-md border border-[#E5E2DD] divide-y divide-[#E5E2DD] max-h-48 overflow-y-auto">
                {sessionAttrs.orders.map((order) => (
                  <div key={order.id} className="px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{order.id}</span>
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {statusLabel(order.status)}
                        </Badge>
                      </div>
                      <span className="font-medium">{formatCurrency(order.total_price)}</span>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {order.items.map((item, i) => (
                          <span key={i}>
                            {item.quantity}x {item.name}
                            {i < order.items.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 px-1 py-2 border-t border-[#E5E2DD] space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(sessionAttrs.orders_total)}</span>
                </div>
                {serviceFeeEnabled && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Taxa de serviço ({serviceFeePercentage}%)</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(serviceFeeAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-foreground" />
                    <span className="text-sm font-semibold">Total</span>
                  </div>
                  <span className="text-lg font-bold text-primary">{formatCurrency(totalWithFee)}</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo de valor manual — só aparece quando não tem pedidos vinculados */}
            {!hasOrders && (
              <div className="space-y-2">
                <Label htmlFor="total_amount" className="text-sm font-medium text-foreground">
                  Valor total da comanda
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    R$
                  </span>
                  <Input
                    id="total_amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex: 150,00"
                    value={formData.total_amount.replace(".", ",")}
                    onChange={(e) => handleCurrencyInput(e.target.value)}
                    className={`h-11 pl-10 ${errors.total_amount ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.total_amount && (
                  <p className="text-xs text-red-500">{errors.total_amount}</p>
                )}
                {serviceFeeEnabled && subtotal > 0 && (
                  <div className="bg-[#FAF9F7] rounded-md border border-[#E5E2DD] p-3 space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Taxa de serviço ({serviceFeePercentage}%)</span>
                      <span className="font-medium">{formatCurrency(serviceFeeAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-1 border-t border-[#E5E2DD]">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-primary">{formatCurrency(totalWithFee)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="close_notes" className="text-sm font-medium text-foreground">
                Observacoes de fechamento (opcional)
              </Label>
              <Textarea
                id="close_notes"
                placeholder="Observacoes sobre o fechamento..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-11 border border-gray-300 cursor-pointer"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white border border-gray-300 cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fechando...
                  </>
                ) : (
                  "Fechar comanda"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
