"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  Clock,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { useSalesByHour } from "../hooks/use-sales-by-hour";
import DateRangePicker from "./date-range-picker";
import SalesByHourChart from "./sales-by-hour-chart";
import ReportExportButton from "@/components/admin/report-export-button";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function SalesByHourTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { data, summary, loading, error } = useSalesByHour(startStr, endStr);

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
          filename="vendas-por-horario"
          headers={["Horário", "Pedidos", "Receita", "% Pedidos", "% Receita"]}
          rows={data?.map(d => [d.label, d.orders, d.revenue, d.order_percentage, d.revenue_percentage]) ?? []}
          disabled={loading || !data}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total de Pedidos
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.total_orders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Faturamento Total
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.total_revenue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Horário de Pico
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.peak_hour?.label || "—"}
                    </p>
                    {summary.peak_hour && (
                      <p className="text-xs text-muted-foreground">
                        {summary.peak_hour.orders} pedidos
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Volume de Vendas por Horário</CardTitle>
            </CardHeader>
            <CardContent>
              {data.some((d) => d.orders > 0) ? (
                <SalesByHourChart data={data} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mb-4" />
                  <p>Nenhum dado no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
