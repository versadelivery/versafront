"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  Truck,
  ShoppingCart,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useAverageDeliveryTime } from "../hooks/use-average-delivery-time";
import DateRangePicker from "./date-range-picker";
import AverageDeliveryTimeChart from "./average-delivery-time-chart";
import ReportExportButton from "@/components/admin/report-export-button";

export default function AverageDeliveryTimeTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { data, summary, loading, error } = useAverageDeliveryTime(
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
          filename="tempo-entrega"
          headers={["Data", "Pedidos", "Tempo Médio (min)"]}
          rows={data?.map(d => [d.label, d.order_count, d.average_minutes]) ?? []}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Entregas Analisadas
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
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Truck className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Média Geral
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.overall_average_minutes} min
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <ThumbsUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Melhor Dia
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.best_day
                        ? `${summary.best_day.average_minutes} min`
                        : "—"}
                    </p>
                    {summary.best_day && (
                      <p className="text-xs text-muted-foreground">
                        {summary.best_day.label}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <ThumbsDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pior Dia
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.worst_day
                        ? `${summary.worst_day.average_minutes} min`
                        : "—"}
                    </p>
                    {summary.worst_day && (
                      <p className="text-xs text-muted-foreground">
                        {summary.worst_day.label}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tempo Médio de Entrega por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              {data.some((d) => d.order_count > 0) ? (
                <AverageDeliveryTimeChart data={data} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Truck className="h-12 w-12 mb-4" />
                  <p>Nenhum dado de entrega no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
