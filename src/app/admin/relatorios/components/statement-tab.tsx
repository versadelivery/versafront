"use client";

import { useState } from "react";
import { CalendarDays, Clock3, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReportExportButton from "@/components/admin/report-export-button";
import { reportsService, StatementResponse } from "../services/reports-service";

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const quantity = (value: number, unit: string) => `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(value)} ${unit}`;

export default function StatementTab() {
  const [date, setDate] = useState(today());
  const [shift, setShift] = useState(false);
  const [start, setStart] = useState("06:00");
  const [end, setEnd] = useState("12:30");
  const [data, setData] = useState<StatementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatement = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await reportsService.getStatement(date, shift ? start : undefined, shift ? end : undefined));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar o extrato.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pt-4">
      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 pt-6">
          <label className="grid gap-1.5 text-sm font-medium">Data
            <input className="h-10 rounded-md border border-input bg-background px-3" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="flex h-10 items-center gap-2 text-sm"><input type="checkbox" checked={shift} onChange={(e) => setShift(e.target.checked)} /> Relatório por turno</label>
          {shift && <>
            <label className="grid gap-1.5 text-sm font-medium">De
              <input className="h-10 rounded-md border border-input bg-background px-3" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">Até
              <input className="h-10 rounded-md border border-input bg-background px-3" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </label>
          </>}
          <Button onClick={fetchStatement} disabled={loading || !date || (shift && (!start || !end))}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Gerar extrato
          </Button>
          {data && <ReportExportButton
            filename="extrato-itens"
            headers={["Item", "Forma de pagamento", "Quantidade", "Valor"]}
            rows={data.items.flatMap((item) => item.payments.map((payment) => [item.name, payment.label, quantity(payment.quantity, item.unit), money(payment.revenue)]))}
            disabled={loading}
          />}
        </CardContent>
      </Card>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {data && <>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {shift ? <Clock3 className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
          {shift ? `Turno das ${start} às ${end}` : "Dia completo"} · {new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR")}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Pedidos pagos", String(data.summary.order_count)],
            ["Itens após ajustes", money(data.summary.item_revenue)],
            ["Taxas de entrega", money(data.summary.delivery_fees)],
            ["Total recebido", money(data.summary.total_revenue)],
          ].map(([label, value]) => <Card key={label}><CardContent className="pt-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></CardContent></Card>)}
        </div>
        <Card>
          <CardHeader><CardTitle className="font-tomato">Itens por forma de pagamento</CardTitle></CardHeader>
          <CardContent>
            {data.items.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhum pedido pago neste período.</p> : <div className="divide-y">
              {data.items.map((item) => <section key={item.name} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-semibold">{item.name}</h3><span className="text-sm text-muted-foreground">{quantity(item.quantity, item.unit)} · {money(item.revenue)}</span></div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {item.payments.map((payment) => <div key={payment.method} className="flex justify-between gap-3 rounded-md bg-muted/40 px-3 py-2 text-sm"><span>{payment.label} <span className="text-muted-foreground">· {quantity(payment.quantity, item.unit)}</span></span><strong>{money(payment.revenue)}</strong></div>)}
                </div>
              </section>)}
            </div>}
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">Os valores de cada item incluem a parcela proporcional dos descontos e acréscimos do pedido.</p>
      </>}
    </div>
  );
}
