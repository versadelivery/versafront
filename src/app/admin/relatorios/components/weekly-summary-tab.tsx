"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Receipt,
  CalendarDays,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWeeklySummary } from "../hooks/use-weekly-summary";
import ReportExportButton from "@/components/admin/report-export-button";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

function VariationBadge({ value }: { value: number | null }) {
  if (value === null || value === undefined) {
    return <span className="text-xs text-muted-foreground">sem dados</span>;
  }

  const isPositive = value >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        isPositive ? "text-emerald-600" : "text-red-600"
      )}
    >
      <Icon className="h-3 w-3" />
      {isPositive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

export default function WeeklySummaryTab() {
  const { currentWeek, comparison, loading, error } = useWeeklySummary();

  return (
    <div className="space-y-6">
      {currentWeek && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Semana: {formatDate(currentWeek.start_date)} —{" "}
            {formatDate(currentWeek.end_date)}
          </p>
          <ReportExportButton
            filename="resumo-semanal"
            headers={["Métrica", "Valor"]}
            rows={currentWeek ? [
              ["Total Vendido", currentWeek.total_revenue],
              ["Pedidos", currentWeek.total_orders],
              ["Ticket Médio", currentWeek.average_ticket],
              ["Melhor Dia", currentWeek.best_day?.label || "—"],
              ["Receita Melhor Dia", currentWeek.best_day?.revenue || 0],
              ["Produto Mais Vendido", currentWeek.top_product?.name || "—"],
              ["Qtd Produto", currentWeek.top_product?.quantity || 0],
            ] : []}
            disabled={loading}
          />
        </div>
      )}

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

      {!loading && !error && currentWeek && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Total Vendido
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(currentWeek.total_revenue)}
                    </p>
                    <VariationBadge
                      value={comparison?.revenue_variation ?? null}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Pedidos</p>
                    <p className="text-2xl font-bold">
                      {currentWeek.total_orders}
                    </p>
                    <VariationBadge
                      value={comparison?.orders_variation ?? null}
                    />
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
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Ticket Médio
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(currentWeek.average_ticket)}
                    </p>
                    <VariationBadge
                      value={comparison?.ticket_variation ?? null}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <CalendarDays className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Melhor Dia</p>
                    {currentWeek.best_day ? (
                      <>
                        <p className="text-xl font-bold">
                          {currentWeek.best_day.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(currentWeek.best_day.revenue)} —{" "}
                          {currentWeek.best_day.orders} pedidos
                        </p>
                      </>
                    ) : (
                      <p className="text-xl font-bold text-muted-foreground">
                        —
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Star className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Produto Mais Vendido
                    </p>
                    {currentWeek.top_product ? (
                      <>
                        <p className="text-xl font-bold">
                          {currentWeek.top_product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {currentWeek.top_product.quantity} unidades —{" "}
                          {formatCurrency(currentWeek.top_product.revenue)}
                        </p>
                      </>
                    ) : (
                      <p className="text-xl font-bold text-muted-foreground">
                        —
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
