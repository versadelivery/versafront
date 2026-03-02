"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, BarChart3 } from "lucide-react";
import { useSalesByPeriod } from "../hooks/use-sales-by-period";
import DateRangePicker from "./date-range-picker";
import SalesSummaryCards from "./sales-summary-cards";
import SalesPeriodChart from "./sales-period-chart";
import SalesPeriodTable from "./sales-period-table";

export default function SalesByPeriodTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { data, loading, error } = useSalesByPeriod(startStr, endStr);

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

      {!loading && !error && data && (
        <>
          <SalesSummaryCards
            totalOrders={data.current_period.total_orders}
            grossRevenue={data.current_period.gross_revenue}
            averageTicket={data.current_period.average_ticket}
            comparison={data.comparison}
          />

          <Card>
            <CardHeader>
              <CardTitle>Faturamento Diário</CardTitle>
            </CardHeader>
            <CardContent>
              {data.current_period.daily_breakdown.some((d) => d.orders > 0) ? (
                <SalesPeriodChart data={data.current_period.daily_breakdown} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mb-4" />
                  <p>Nenhum dado de vendas no período</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento Diário</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesPeriodTable data={data.current_period.daily_breakdown} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
