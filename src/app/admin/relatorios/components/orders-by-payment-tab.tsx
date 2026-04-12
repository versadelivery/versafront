"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, AlertTriangle, ShoppingCart, DollarSign, Package2, Home } from "lucide-react";
import { useOrdersByPayment } from "../hooks/use-orders-by-payment";
import ReportExportButton from "@/components/admin/report-export-button";
import { cn } from "@/lib/utils";

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

export default function OrdersByPaymentTab() {
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const { data, summary, loading, error } = useOrdersByPayment(date);

  // Lista plana de pedidos com info de pagamento embutida
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
          headers={["Forma de Pagamento", "Pedido", "Hora", "Cliente", "Tipo", "Status", "Total"]}
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
                      <TableHead className="text-right">Total</TableHead>
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
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(order.total_price)}
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
    </div>
  );
}
