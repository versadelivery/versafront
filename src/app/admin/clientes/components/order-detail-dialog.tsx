"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const statusLabels: Record<string, string> = {
  received: "Recebido",
  accepted: "Aceito",
  in_analysis: "Em análise",
  in_preparation: "Em preparo",
  ready: "Pronto",
  left_for_delivery: "Saiu p/ entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusColors: Record<string, { border: string; dot: string; text: string }> = {
  received: { border: "border-amber-400", dot: "bg-amber-400", text: "text-amber-700" },
  accepted: { border: "border-blue-400", dot: "bg-blue-400", text: "text-blue-700" },
  in_analysis: { border: "border-orange-400", dot: "bg-orange-400", text: "text-orange-700" },
  in_preparation: { border: "border-indigo-400", dot: "bg-indigo-400", text: "text-indigo-700" },
  ready: { border: "border-emerald-400", dot: "bg-emerald-400", text: "text-emerald-700" },
  left_for_delivery: { border: "border-purple-400", dot: "bg-purple-400", text: "text-purple-700" },
  delivered: { border: "border-green-400", dot: "bg-green-400", text: "text-green-700" },
  cancelled: { border: "border-red-400", dot: "bg-red-400", text: "text-red-700" },
};

const paymentLabels: Record<string, string> = {
  cash: "Dinheiro",
  debit: "Débito",
  credit: "Crédito",
  manual_pix: "PIX",
  asaas_pix: "PIX Automático",
};

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num || 0);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderData: any | null;
  isLoading: boolean;
}

export default function OrderDetailDialog({
  open,
  onOpenChange,
  orderData,
  isLoading,
}: OrderDetailDialogProps) {
  const attrs = orderData?.attributes;
  const items: any[] = attrs?.items?.data || [];
  const address = attrs?.address?.data?.attributes;
  const customer = attrs?.customer?.data?.attributes;
  const status = attrs?.status ? (statusColors[attrs.status] || statusColors.received) : null;

  const subtotal = parseFloat(attrs?.total_items_price || "0");
  const deliveryFee = parseFloat(attrs?.delivery_fee || "0");
  const discount = parseFloat(attrs?.discount_amount || "0");
  const paymentAdj = parseFloat(attrs?.payment_adjustment_amount || "0");
  const manualAdj = parseFloat(attrs?.manual_adjustment || "0");
  const total = parseFloat(attrs?.total_price || "0");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-tomato text-base font-bold text-gray-900">
            {orderData ? `Pedido #${orderData.id}` : "Detalhes do Pedido"}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && attrs && (
          <div className="space-y-4">
            {/* Status + Data */}
            <div className="flex items-center justify-between py-1">
              {status && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-white text-sm font-semibold",
                    status.border,
                    status.text
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                  {statusLabels[attrs.status] || attrs.status}
                </span>
              )}
              <span className="text-sm text-muted-foreground">{formatDate(attrs.created_at)}</span>
            </div>

            {/* Cliente */}
            {customer && (
              <div className="bg-[#FAF9F7] rounded-md border border-[#E5E2DD] px-4 py-3 text-sm">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Cliente</p>
                <p className="font-medium text-gray-900">{customer.name}</p>
                {customer.cellphone && customer.cellphone !== "N/A" && (
                  <p className="text-muted-foreground">{customer.cellphone}</p>
                )}
              </div>
            )}

            {/* Itens */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Itens</p>
              <div className="rounded-md border border-[#E5E2DD] overflow-hidden bg-white divide-y divide-[#F0EFEB]">
                {items.map((item) => {
                  const ia = item.attributes;
                  const name =
                    ia.catalog_item?.data?.attributes?.name || ia.name || "Item";
                  const extras: any[] = ia.selected_extras || [];
                  const prepareMethods: any[] = ia.selected_prepare_methods || [];
                  const steps: any[] = ia.selected_steps || [];
                  const complements: any[] = ia.complements || [];

                  return (
                    <div key={item.id} className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          <span className="text-muted-foreground mr-1.5">{ia.quantity}x</span>
                          {name}
                        </p>
                        {ia.observation && (
                          <p className="text-xs text-muted-foreground mt-0.5 italic">{ia.observation}</p>
                        )}
                        {extras.map((e: any) => (
                          <p key={e.name} className="text-xs text-muted-foreground">
                            + {e.name} ({formatCurrency(e.price)})
                          </p>
                        ))}
                        {prepareMethods.map((pm: any) => (
                          <p key={pm.name} className="text-xs text-muted-foreground">{pm.name}</p>
                        ))}
                        {steps.map((step: any) => (
                          <p key={step.step_name} className="text-xs text-muted-foreground">
                            {step.step_name}: {step.option_name}
                          </p>
                        ))}
                        {complements.map((c: any) => (
                          <p key={c.name} className="text-xs text-muted-foreground">
                            + {c.name} ({formatCurrency(c.price)})
                          </p>
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {formatCurrency(ia.total_price)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Endereço */}
            {address && (
              <div className="bg-[#FAF9F7] rounded-md border border-[#E5E2DD] px-4 py-3 text-sm">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                  Endereço de entrega
                </p>
                <p className="font-medium text-gray-900">{address.address}</p>
                <p className="text-muted-foreground">{address.neighborhood}</p>
                {address.complement && (
                  <p className="text-muted-foreground">Complemento: {address.complement}</p>
                )}
                {address.reference && (
                  <p className="text-muted-foreground">Referência: {address.reference}</p>
                )}
              </div>
            )}

            {attrs.withdrawal && !address && (
              <div className="bg-[#FAF9F7] rounded-md border border-[#E5E2DD] px-4 py-3 text-sm">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Entrega</p>
                <p className="font-medium text-gray-900">Retirada no local</p>
              </div>
            )}

            {/* Totais */}
            <div className="rounded-md border border-[#E5E2DD] overflow-hidden bg-white">
              <div className="px-4 py-3 border-b border-[#E5E2DD]">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Resumo</p>
              </div>
              <div className="px-4 py-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de entrega</span>
                    <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Desconto{attrs.coupon_code ? ` (${attrs.coupon_code})` : ""}
                    </span>
                    <span className="font-medium text-green-600">-{formatCurrency(discount)}</span>
                  </div>
                )}
                {paymentAdj !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ajuste de pagamento</span>
                    <span className="font-medium">{formatCurrency(paymentAdj)}</span>
                  </div>
                )}
                {manualAdj !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ajuste manual</span>
                    <span className="font-medium">{formatCurrency(manualAdj)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#E5E2DD] font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">Pagamento</span>
                  <span className="font-medium">
                    {paymentLabels[attrs.payment_method] || attrs.payment_method}
                  </span>
                </div>
                {attrs.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pago em</span>
                    <span className="font-medium">{formatDate(attrs.paid_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
