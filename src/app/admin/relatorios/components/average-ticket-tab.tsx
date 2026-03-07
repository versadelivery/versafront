"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertTriangle,
  BarChart3,
  ShoppingCart,
  DollarSign,
  Receipt,
} from "lucide-react";
import { useAverageTicket } from "../hooks/use-average-ticket";
import DateRangePicker from "./date-range-picker";
import AverageTicketChart from "./average-ticket-chart";
import ReportExportButton from "@/components/admin/report-export-button";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const GRANULARITY_OPTIONS = [
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
] as const;

export default function AverageTicketTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [granularity, setGranularity] = useState("daily");

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { breakdown, summary, loading, error } = useAverageTicket(
    startStr,
    endStr,
    granularity
  );

  const handleDateChange = (newStart: Date, newEnd: Date) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
          />
          <div className="flex gap-1">
            {GRANULARITY_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={granularity === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setGranularity(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
        <ReportExportButton
          filename="ticket-medio"
          headers={["Período", "Pedidos", "Receita", "Ticket Médio"]}
          rows={breakdown?.map(d => [d.label, d.orders, d.revenue, d.average_ticket]) ?? []}
          summaryData={summary ? {
            "Total Pedidos": summary.total_orders,
            "Receita Bruta": summary.gross_revenue,
            "Ticket Médio": summary.average_ticket,
          } : undefined}
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
                      Faturamento Bruto
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.gross_revenue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Receipt className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Ticket Médio
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.average_ticket)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-tomato">Ticket Médio por Período</CardTitle>
            </CardHeader>
            <CardContent>
              {breakdown.some((d) => d.orders > 0) ? (
                <AverageTicketChart data={breakdown} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mb-4" />
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
