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
  ShoppingCart,
  DollarSign,
  Wallet,
} from "lucide-react";
import { usePaymentMethods } from "../hooks/use-payment-methods";
import ReportExportButton from "@/components/admin/report-export-button";
import DateRangePicker from "./date-range-picker";
import PaymentMethodsChart from "./payment-methods-chart";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function PaymentMethodsTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { data, summary, loading, error } = usePaymentMethods(
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
          filename="formas-de-pagamento"
          headers={["Forma", "Pedidos", "% Pedidos", "Receita", "% Receita"]}
          rows={data?.map(d => [d.label, d.order_count, d.order_percentage, d.revenue, d.revenue_percentage]) ?? []}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-tomato">Distribuição por Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              {data.length > 0 ? (
                <PaymentMethodsChart data={data} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Wallet className="h-12 w-12 mb-4" />
                  <p>Nenhum dado no período</p>
                </div>
              )}
            </CardContent>
          </Card>

          {data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-tomato">Detalhamento</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Forma de Pagamento</TableHead>
                      <TableHead className="text-right">Pedidos</TableHead>
                      <TableHead className="text-right">% Pedidos</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                      <TableHead className="text-right">
                        % Faturamento
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((method) => (
                      <TableRow key={method.key}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: method.color }}
                            />
                            <span className="font-medium">{method.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {method.order_count}
                        </TableCell>
                        <TableCell className="text-right">
                          {method.order_percentage}%
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(method.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {method.revenue_percentage}%
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
