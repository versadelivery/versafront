"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Trophy,
  CalendarDays,
} from "lucide-react";
import { useMonthlyRevenue } from "../hooks/use-monthly-revenue";
import RevenueChart from "./revenue-chart";
import RevenueTable from "./revenue-table";
import ReportExportButton from "@/components/admin/report-export-button";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function MonthlyRevenueTab() {
  const { data, summary, loading, error } = useMonthlyRevenue();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <ReportExportButton
          filename="faturamento-mensal"
          headers={["Mês", "Receita", "Variação (%)"]}
          rows={data.map(d => [d.label, d.revenue, d.variation_percentage ?? "—"])}
          summaryData={summary ? {
            "Receita Total": summary.total_revenue,
            "Média Mensal": summary.average_monthly,
          } : undefined}
          disabled={loading || !data}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Faturamento Total
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary?.total_revenue || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Média Mensal</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary?.average_monthly || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Melhor Mês</p>
                <p className="text-2xl font-bold">
                  {summary?.best_month
                    ? formatCurrency(summary.best_month.revenue)
                    : "—"}
                </p>
                {summary?.best_month && (
                  <p className="text-xs text-muted-foreground">
                    {summary.best_month.label}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <CalendarDays className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mês Atual</p>
                <p className="text-2xl font-bold">
                  {summary?.current_month
                    ? formatCurrency(summary.current_month.revenue)
                    : "—"}
                </p>
                {summary?.current_month && (
                  <p className="text-xs text-muted-foreground">
                    {summary.current_month.label}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faturamento por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <RevenueChart data={data} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mb-4" />
              <p>Nenhum dado de faturamento disponível</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <RevenueTable data={data} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mb-4" />
              <p>Nenhum dado de faturamento disponível</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
