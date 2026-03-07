"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
} from "lucide-react";
import { useItemProfitability } from "../hooks/use-item-profitability";
import DateRangePicker from "./date-range-picker";
import ItemProfitabilityTable from "./item-profitability-table";
import ReportExportButton from "@/components/admin/report-export-button";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function ItemProfitabilityTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { items, summary, loading, error } = useItemProfitability(
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
          filename="lucratividade"
          headers={["Item", "Qtd Vendida", "Receita", "Custo", "Lucro", "Margem (%)"]}
          rows={items?.map(d => [d.name, d.quantity_sold, d.revenue, d.total_cost, d.profit, d.margin_percentage ?? "—"]) ?? []}
          summaryData={summary ? { "Receita Total": summary.total_revenue, "Custo Total": summary.total_cost, "Lucro Total": summary.total_profit, "Margem Geral": summary.overall_margin_percentage + "%" } : undefined}
          disabled={loading || !items}
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
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Receita</p>
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
                  <div className="p-2 rounded-lg bg-red-100">
                    <Package className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Custo Total</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.total_cost)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Lucro ({summary.overall_margin_percentage}%)
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.total_profit)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {summary.items_without_cost > 0 && (
              <Card>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Sem Custo
                      </p>
                      <p className="text-2xl font-bold">
                        {summary.items_without_cost}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-tomato">Lucratividade por Item</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length > 0 ? (
                <ItemProfitabilityTable data={items} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mb-4" />
                  <p>Nenhum dado de vendas no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
