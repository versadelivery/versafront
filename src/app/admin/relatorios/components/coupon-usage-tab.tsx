"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  Ticket,
  ShoppingCart,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { useCouponUsage } from "../hooks/use-coupon-usage";
import DateRangePicker from "./date-range-picker";
import CouponUsageTable from "./coupon-usage-table";
import ReportExportButton from "@/components/admin/report-export-button";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function CouponUsageTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { coupons, summary, loading, error } = useCouponUsage(
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
          filename="cupons-utilizados"
          headers={["Código", "Tipo Desconto", "Valor", "Usos no Período", "Total Desconto", "Receita Pedidos"]}
          rows={coupons?.map(d => [d.code, d.discount_type_label, d.value, d.usage_count_period, d.total_discount_given, d.total_orders_revenue]) ?? []}
          summaryData={summary ? { "Cupons Utilizados": summary.total_coupons_used, "Pedidos com Cupom": summary.total_orders_with_coupon, "Total Descontos": summary.total_discount_given } : undefined}
          disabled={loading || !coupons}
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
                  <div className="p-2 rounded-lg">
                    <Ticket className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Cupons Utilizados
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.total_coupons_used}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pedidos com Cupom
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.total_orders_with_coupon}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total em Descontos
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.total_discount_given)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Desconto Médio/Pedido
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.average_discount_per_order)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-tomato">Cupons Utilizados</CardTitle>
            </CardHeader>
            <CardContent>
              {coupons.length > 0 ? (
                <CouponUsageTable data={coupons} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Ticket className="h-12 w-12 mb-4" />
                  <p>Nenhum cupom utilizado no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
