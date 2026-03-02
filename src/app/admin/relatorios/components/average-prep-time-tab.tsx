"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  Clock,
  ShoppingCart,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useAveragePrepTime } from "../hooks/use-average-prep-time";
import DateRangePicker from "./date-range-picker";
import AveragePrepTimeChart from "./average-prep-time-chart";

export default function AveragePrepTimeTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { data, summary, loading, error } = useAveragePrepTime(
    startStr,
    endStr
  );

  const handleDateChange = (newStart: Date, newEnd: Date) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  return (
    <div className="space-y-6">
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateChange}
      />

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
                      Pedidos Analisados
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
                    <Clock className="h-5 w-5 text-amber-600" />
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
              <CardTitle>Tempo Médio de Preparo por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              {data.some((d) => d.order_count > 0) ? (
                <AveragePrepTimeChart data={data} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mb-4" />
                  <p>Nenhum dado de preparo no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
