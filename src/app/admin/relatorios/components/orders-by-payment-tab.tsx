"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2, AlertTriangle, ShoppingCart, DollarSign, Package2, Home,
  Eye, CheckCircle2, Clock, MapPin, User, CreditCard, Receipt,
} from "lucide-react";
import { useOrdersByPayment } from "../hooks/use-orders-by-payment";
import ReportExportButton from "@/components/admin/report-export-button";
import { cn } from "@/lib/utils";
import api from "@/api/config";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const STATUS_COLORS: Record<string, string> = {
  delivered: "bg-green-100 text-green-700",
  ready: "bg-blue-100 text-blue-700",
  in_preparation: "bg-yellow-100 text-yellow-700",
  accepted: "bg-indigo-100 text-indigo-700",
  received: "bg-gray-100 text-gray-600",
  left_for_delivery: "bg-purple-100 text-purple-700",
  in_analysis: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-600",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  debit: "Débito",
  credit: "Crédito",
  manual_pix: "PIX",
  asaas_pix: "PIX Online",
};

const STATUS_LABELS: Record<string, string> = {
  received: "Recebido",
  accepted: "Aceito",
  in_analysis: "Em análise",
  in_preparation: "Em preparo",
  ready: "Pronto",
  left_for_delivery: "Saiu p/ entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

interface OrderDetail {
  id: number;
  status: string;
  payment_method: string;
  total_price: string;
  total_items_price: string;
  delivery_fee: string | null;
  discount_amount: string | null;
  payment_adjustment_amount: string | null;
  manual_adjustment: string | null;
  coupon_code: string | null;
  withdrawal: boolean;
  created_at: string;
  paid_at: string | null;
  delivery_person: string | null;
  items: { data: Array<{ id: string; attributes: { name: string; quantity: number; total_price: string; observation?: string; selected_extras: Array<{ name: string; price: string }>; selected_prepare_methods: Array<{ name: string }> } }> };
  customer: { data: { attributes: { name: string; cellphone?: string } } };
  address: { data: { attributes: { address: string; neighborhood: string; complement?: string } } | null };
}

function OrderDetailDialog({ orderId, onClose }: { orderId: number | null; onClose: () => void }) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setDetail(null);
    setError(false);
    setLoading(true);
    api.get(`/orders/${orderId}`)
      .then((r) => setDetail(r.data?.data?.attributes ?? null))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  const subtotal = detail ? parseFloat(detail.total_items_price || "0") : 0;
  const deliveryFee = detail ? parseFloat(detail.delivery_fee || "0") : 0;
  const discount = detail ? parseFloat(detail.discount_amount || "0") : 0;
  const paymentAdj = detail ? parseFloat(detail.payment_adjustment_amount || "0") : 0;
  const manualAdj = detail ? parseFloat(detail.manual_adjustment || "0") : 0;
  const total = detail ? parseFloat(detail.total_price || "0") : 0;

  return (
    <Dialog open={!!orderId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-red-500">
            <AlertTriangle className="h-8 w-8" />
            <p className="text-sm">Não foi possível carregar o pedido.</p>
          </div>
        )}
        {detail && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 flex-wrap">
                <span>Pedido #{detail.id}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[detail.status] ?? "bg-gray-100 text-gray-600")}>
                  {STATUS_LABELS[detail.status] ?? detail.status}
                </span>
                {detail.paid_at ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Pago
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    <Clock className="h-3 w-3" /> Pendente
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {/* Informações gerais */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                    <p className="font-medium">{detail.customer?.data?.attributes?.name ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pagamento</p>
                    <p className="font-medium">{PAYMENT_LABELS[detail.payment_method] ?? detail.payment_method}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Home className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <p className="font-medium">{detail.withdrawal ? "Retirada" : "Entrega"}</p>
                  </div>
                </div>
                {detail.delivery_person && (
                  <div className="flex items-start gap-2">
                    <Receipt className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Entregador</p>
                      <p className="font-medium">{detail.delivery_person}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Endereço */}
              {!detail.withdrawal && detail.address?.data && (
                <div className="flex items-start gap-2 text-sm bg-muted/40 rounded-md p-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Endereço</p>
                    <p className="font-medium">{detail.address.data.attributes.address}</p>
                    <p className="text-muted-foreground">{detail.address.data.attributes.neighborhood}</p>
                    {detail.address.data.attributes.complement && (
                      <p className="text-muted-foreground">{detail.address.data.attributes.complement}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Itens */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Itens</p>
                <div className="space-y-2">
                  {detail.items.data.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-sm gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {item.attributes.quantity}× {item.attributes.name}
                        </p>
                        {item.attributes.observation && (
                          <p className="text-xs text-muted-foreground">{item.attributes.observation}</p>
                        )}
                        {item.attributes.selected_extras.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            + {item.attributes.selected_extras.map((e) => e.name).join(", ")}
                          </p>
                        )}
                        {item.attributes.selected_prepare_methods.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {item.attributes.selected_prepare_methods.map((m) => m.name).join(", ")}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold shrink-0">
                        {formatCurrency(parseFloat(item.attributes.total_price || "0"))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo financeiro */}
              <div className="border-t pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxa de entrega</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto{detail.coupon_code ? ` (${detail.coupon_code})` : ""}</span>
                    <span>- {formatCurrency(discount)}</span>
                  </div>
                )}
                {paymentAdj !== 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Ajuste de pagamento</span>
                    <span>{paymentAdj > 0 ? "+" : ""}{formatCurrency(paymentAdj)}</span>
                  </div>
                )}
                {manualAdj !== 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Ajuste manual</span>
                    <span>{manualAdj > 0 ? "+" : ""}{formatCurrency(manualAdj)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function OrdersByPaymentTab() {
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data, summary, loading, error } = useOrdersByPayment(date);

  const allOrders = data.flatMap((group) =>
    group.orders.map((o) => ({
      ...o,
      payment_method_key: group.payment_method,
      payment_method_label: group.label,
      payment_method_color: group.color,
    }))
  ).sort((a, b) => a.time_label.localeCompare(b.time_label));

  const filteredOrders =
    activeFilter === "all"
      ? allOrders
      : allOrders.filter((o) => o.payment_method_key === activeFilter);

  const exportRows = filteredOrders.map((o) => [
    o.payment_method_label,
    `#${o.id}`,
    o.time_label,
    o.customer_name,
    o.withdrawal ? "Retirada" : "Entrega",
    o.status_label,
    o.paid_at ? "Pago" : "Pendente",
    formatCurrency(o.total_price),
  ]);

  const filteredRevenue = filteredOrders.reduce((s, o) => s + o.total_price, 0);

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setActiveFilter("all"); }}
            className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <ReportExportButton
          filename={`pedidos-por-pagamento-${date}`}
          headers={["Forma de Pagamento", "Pedido", "Hora", "Cliente", "Tipo", "Status", "Pago", "Total"]}
          rows={exportRows}
          disabled={loading || !allOrders.length}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && summary && (
        <>
          {/* Cards resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pedidos{activeFilter !== "all" ? " (filtrado)" : ""}</p>
                    <p className="text-2xl font-bold">{filteredOrders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Faturamento{activeFilter !== "all" ? " (filtrado)" : ""}</p>
                    <p className="text-2xl font-bold">{formatCurrency(filteredRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros por forma de pagamento */}
          {data.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                  activeFilter === "all"
                    ? "bg-zinc-700 text-white border-zinc-700"
                    : "bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500"
                )}
              >
                Todos ({allOrders.length})
              </button>
              {data.map((group) => (
                <button
                  key={group.payment_method}
                  onClick={() => setActiveFilter(group.payment_method)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                  style={
                    activeFilter === group.payment_method
                      ? { backgroundColor: group.color, borderColor: group.color, color: "#fff" }
                      : { backgroundColor: "#fff", borderColor: "#d4d4d8", color: "#52525b" }
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: activeFilter === group.payment_method ? "#fff" : group.color }}
                  />
                  {group.label} ({group.order_count})
                </button>
              ))}
            </div>
          )}

          {/* Tabela de pedidos */}
          {allOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Package2 className="h-12 w-12 mb-4" />
                <p>Nenhum pedido nesta data</p>
              </CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>Nenhum pedido com esta forma de pagamento</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hora</TableHead>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-muted-foreground">
                          {order.time_label}
                        </TableCell>
                        <TableCell className="font-semibold text-muted-foreground">
                          #{order.id}
                        </TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: order.payment_method_color }}
                            />
                            <span className="font-medium">{order.payment_method_label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.withdrawal ? (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Home className="h-3.5 w-3.5" /> Retirada
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Entrega</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium",
                              STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"
                            )}
                          >
                            {order.status_label}
                          </span>
                        </TableCell>
                        <TableCell>
                          {order.paid_at ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Pago
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                              <Clock className="h-3.5 w-3.5" /> Pendente
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(order.total_price)}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <OrderDetailDialog
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
