"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  Eye,
  ShoppingCart,
  Percent,
} from "lucide-react";
import { useVisitors } from "../hooks/use-visitors";
import ReportExportButton from "@/components/admin/report-export-button";
import DateRangePicker from "./date-range-picker";
import VisitorsChart from "./visitors-chart";

export default function VisitorsTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { breakdown, summary, loading, error } = useVisitors(startStr, endStr);

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
          filename="visitantes"
          headers={["Data", "Visitantes Únicos"]}
          rows={breakdown?.map(d => [d.label, d.unique_visitors]) ?? []}
          summaryData={summary ? { "Total Visitantes": summary.total_unique_visitors, "Total Pedidos": summary.total_orders, "Taxa Conversão": summary.conversion_rate_percentage + "%" } : undefined}
          disabled={loading || !breakdown}
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
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Visitantes Únicos
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.total_unique_visitors}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pedidos no Período
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
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Percent className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Taxa de Conversão
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.conversion_rate_percentage}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Visitantes por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              {breakdown.some((d) => d.unique_visitors > 0) ? (
                <VisitorsChart data={breakdown} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Eye className="h-12 w-12 mb-4" />
                  <p>Nenhum visitante no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
