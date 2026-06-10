"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { AlertTriangle, Loader2, Receipt, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DateRangePicker from "./date-range-picker";
import ReportExportButton from "@/components/admin/report-export-button";
import { useStoreCreditReceivables } from "../hooks/use-store-credit-receivables";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("pt-BR") : "—";
}

export default function StoreCreditReceivablesTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");
  const { customers, summary, loading, error } = useStoreCreditReceivables(startStr, endStr);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <DateRangePicker startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />
        <ReportExportButton
          filename="crediario-em-aberto"
          headers={["Cliente", "Telefone", "Pedidos em aberto", "Total em aberto", "Primeira dívida", "Última dívida"]}
          rows={customers.map(c => [c.name, c.phone || "—", c.open_orders_count, c.outstanding_amount, formatDate(c.oldest_order_at), formatDate(c.last_order_at)])}
          summaryData={summary ? {
            "Total em aberto": summary.total_outstanding,
            "Clientes devendo": summary.total_customers,
            "Pedidos em aberto": summary.total_open_orders,
            "Média por cliente": summary.average_debt_per_customer,
          } : undefined}
          disabled={loading || !summary}
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
            <Card><CardContent><Metric icon={<Wallet className="h-5 w-5 text-amber-600" />} label="Total em aberto" value={formatCurrency(summary.total_outstanding)} /></CardContent></Card>
            <Card><CardContent><Metric icon={<Users className="h-5 w-5 text-blue-600" />} label="Clientes devendo" value={summary.total_customers} /></CardContent></Card>
            <Card><CardContent><Metric icon={<Receipt className="h-5 w-5 text-purple-600" />} label="Pedidos em aberto" value={summary.total_open_orders} /></CardContent></Card>
            <Card><CardContent><Metric icon={<Wallet className="h-5 w-5 text-emerald-600" />} label="Média por cliente" value={formatCurrency(summary.average_debt_per_customer)} /></CardContent></Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-tomato">Clientes com fiado em aberto</CardTitle>
            </CardHeader>
            <CardContent>
              {customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Wallet className="h-12 w-12 mb-4" />
                  <p>Nenhuma dívida em aberto no período</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead className="text-right">Pedidos</TableHead>
                      <TableHead className="text-right">Total em aberto</TableHead>
                      <TableHead>Última dívida</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={`${customer.customer_id || customer.name}-${customer.phone}`}>
                        <TableCell>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {customer.orders.map(o => `#${o.id} ${formatCurrency(o.total_price)}`).join(" · ")}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{customer.phone || "—"}</TableCell>
                        <TableCell className="text-right">{customer.open_orders_count}</TableCell>
                        <TableCell className="text-right font-semibold text-amber-700">{formatCurrency(customer.outstanding_amount)}</TableCell>
                        <TableCell>{formatDate(customer.last_order_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
