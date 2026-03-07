"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  Ticket,
  DollarSign,
  Percent,
  ShoppingCart,
} from "lucide-react";
import { useDiscountedOrders } from "../hooks/use-discounted-orders";
import DateRangePicker from "./date-range-picker";
import DiscountedOrdersTable from "./discounted-orders-table";
import ReportExportButton from "@/components/admin/report-export-button";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function DiscountedOrdersTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { orders, summary, loading, error } = useDiscountedOrders(
    startStr,
    endStr
  );

  const handleDateChange = (newStart: Date, newEnd: Date) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
        />
        <ReportExportButton
          filename="descontos"
          headers={["Pedido", "Data", "Subtotal", "Desconto", "Total", "Cupom", "Pagamento"]}
          rows={orders?.map(d => [d.id, d.date_label, d.total_items_price, d.discount_amount, d.total_price, d.coupon_code || "—", d.payment_method_label]) ?? []}
          summaryData={summary ? { "Pedidos com Desconto": summary.total_discounted_orders, "Total Descontos": summary.total_discount, "Desconto Médio": summary.average_discount } : undefined}
          disabled={loading || !orders}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pedidos com Desconto
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.total_discounted_orders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <DollarSign className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total em Descontos
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.total_discount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Ticket className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Desconto Médio
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.average_discount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Percent className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      % com Desconto
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.discount_percentage}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-tomato">Pedidos com Desconto</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <DiscountedOrdersTable data={orders} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Ticket className="h-12 w-12 mb-4" />
                  <p>Nenhum pedido com desconto no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
