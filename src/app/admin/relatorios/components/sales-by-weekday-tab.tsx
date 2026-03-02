"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  AlertTriangle,
  CalendarDays,
  ShoppingCart,
  DollarSign,
  Trophy,
} from "lucide-react";
import { useSalesByWeekday } from "../hooks/use-sales-by-weekday";
import DateRangePicker from "./date-range-picker";
import SalesByWeekdayChart from "./sales-by-weekday-chart";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function SalesByWeekdayTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { data, summary, loading, error } = useSalesByWeekday(
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
                    <Trophy className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Melhor Dia
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.best_day?.label || "—"}
                    </p>
                    {summary.best_day && (
                      <p className="text-xs text-muted-foreground">
                        {summary.best_day.orders} pedidos
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vendas por Dia da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              {data.some((d) => d.orders > 0) ? (
                <SalesByWeekdayChart data={data} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mb-4" />
                  <p>Nenhum dado no período</p>
                </div>
              )}
            </CardContent>
          </Card>

          {data.some((d) => d.orders > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dia</TableHead>
                      <TableHead className="text-right">Pedidos</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                      <TableHead className="text-right">Ticket Médio</TableHead>
                      <TableHead className="text-right">% Pedidos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((day) => (
                      <TableRow key={day.weekday}>
                        <TableCell className="font-medium">
                          {day.label}
                        </TableCell>
                        <TableCell className="text-right">
                          {day.orders}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(day.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(day.average_ticket)}
                        </TableCell>
                        <TableCell className="text-right">
                          {day.order_percentage}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
