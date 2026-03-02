"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Package } from "lucide-react";
import { useSalesByItem } from "../hooks/use-sales-by-item";
import DateRangePicker from "./date-range-picker";
import SalesByItemChart from "./sales-by-item-chart";
import SalesByItemTable from "./sales-by-item-table";
import ReportExportButton from "@/components/admin/report-export-button";

export default function SalesByItemTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [view, setView] = useState<"items" | "groups">("items");

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { items, groups, loading, error } = useSalesByItem(startStr, endStr);

  const handleDateChange = (newStart: Date, newEnd: Date) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const currentData = view === "items" ? items : groups;

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
            <Button
              variant={view === "items" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("items")}
            >
              Itens
            </Button>
            <Button
              variant={view === "groups" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("groups")}
            >
              Grupos
            </Button>
          </div>
        </div>
        <ReportExportButton
          filename="vendas-por-item"
          headers={["Item", "Quantidade", "Receita", "% do Total"]}
          rows={items?.map(d => [d.name, d.quantity, d.revenue, d.percentage]) ?? []}
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

      {!loading && !error && (
        <>
          {currentData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top 10 {view === "items" ? "Itens" : "Grupos"}</CardTitle>
              </CardHeader>
              <CardContent>
                <SalesByItemChart data={currentData} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                {view === "items" ? "Ranking de Itens" : "Ranking de Grupos"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentData.length > 0 ? (
                <SalesByItemTable data={currentData} />
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
