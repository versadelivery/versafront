"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, DollarSign, Loader2, PackageCheck, Truck } from "lucide-react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DateRangePicker from "./date-range-picker";
import ReportExportButton from "@/components/admin/report-export-button";
import { reportsService, SalesByDeliveryPersonResponse } from "../services/reports-service";

const currency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default function SalesByDeliveryPersonTab() {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(new Date());
  const [result, setResult] = useState<SalesByDeliveryPersonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const start = format(startDate, "yyyy-MM-dd");
  const end = format(endDate, "yyyy-MM-dd");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    reportsService.getSalesByDeliveryPerson(start, end)
      .then((data) => { if (active) setResult(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [start, end]);

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <DateRangePicker startDate={startDate} endDate={endDate} onChange={(from, to) => { setStartDate(from); setEndDate(to); }} />
      <ReportExportButton filename="vendas-por-entregador" headers={["Entregador", "Pedidos", "Faturamento", "Ticket Médio"]}
        rows={result?.data.map((d) => [d.delivery_person_name, d.order_count, d.revenue, d.average_ticket]) ?? []} disabled={loading || !result} />
    </div>
    {loading && <div className="flex justify-center py-20"><Loader2 className="h-9 w-9 animate-spin text-muted-foreground" /></div>}
    {error && <div className="flex items-center justify-center gap-3 py-16 text-red-600"><AlertTriangle className="h-5 w-5" />Falha ao carregar o relatório.</div>}
    {!loading && !error && result && <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 pt-5"><Truck className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-muted-foreground">Entregadores</p><p className="text-xl font-semibold">{result.summary.total_delivery_people}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 pt-5"><PackageCheck className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-muted-foreground">Pedidos pagos</p><p className="text-xl font-semibold">{result.summary.total_orders}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 pt-5"><DollarSign className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-muted-foreground">Faturamento</p><p className="text-xl font-semibold">{currency(result.summary.total_revenue)}</p></div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="font-tomato">Vendas por Entregador</CardTitle></CardHeader><CardContent>
        {result.data.length ? <Table><TableHeader><TableRow><TableHead>#</TableHead><TableHead>Entregador</TableHead><TableHead className="text-right">Pedidos</TableHead><TableHead className="text-right">Faturamento</TableHead><TableHead className="text-right">Ticket Médio</TableHead></TableRow></TableHeader>
          <TableBody>{result.data.map((row, index) => <TableRow key={row.delivery_person_id}><TableCell className="text-muted-foreground">{index + 1}</TableCell><TableCell className="font-medium">{row.delivery_person_name}</TableCell><TableCell className="text-right">{row.order_count}</TableCell><TableCell className="text-right">{currency(row.revenue)}</TableCell><TableCell className="text-right">{currency(row.average_ticket)}</TableCell></TableRow>)}</TableBody></Table>
          : <p className="py-10 text-center text-sm text-muted-foreground">Nenhum pedido pago com entregador atribuído neste período.</p>}
      </CardContent></Card>
    </>}
  </div>;
}
