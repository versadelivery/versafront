"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, Clock3, CreditCard, Loader2, Search } from "lucide-react";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ReportExportButton from "@/components/admin/report-export-button";
import { reportsService, StatementResponse } from "../services/reports-service";

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const quantity = (value: number, unit: string) => `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(value)} ${unit}`;

// Mesma ordem/rótulos da API; usado enquanto nenhum extrato foi gerado.
const DEFAULT_METHODS = [
  { method: "all", label: "Todos" },
  { method: "cash", label: "Dinheiro" },
  { method: "debit", label: "Débito" },
  { method: "credit", label: "Crédito" },
  { method: "pix", label: "PIX (todos)" },
  { method: "manual_pix", label: "PIX Direto" },
  { method: "asaas_pix", label: "PIX Automático" },
  { method: "store_credit", label: "Fiado / a receber" },
  { method: "food_voucher", label: "Vale alimentação / refeição" },
];

const errorMessage = (e: unknown) => {
  if (isAxiosError(e)) return e.response?.data?.error ?? "Não foi possível carregar o extrato.";
  return e instanceof Error ? e.message : "Não foi possível carregar o extrato.";
};

interface Applied { date: string; shift: boolean; start: string; end: string; method: string }

export default function StatementTab() {
  const [date, setDate] = useState(today());
  const [shift, setShift] = useState(false);
  const [start, setStart] = useState("06:00");
  const [end, setEnd] = useState("12:30");
  const [method, setMethod] = useState("all");
  const [data, setData] = useState<StatementResponse | null>(null);
  const [applied, setApplied] = useState<Applied | null>(null); // período do resultado exibido, não dos inputs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async (params: Applied) => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const next = await reportsService.getStatement(params.date, params.shift ? params.start : undefined, params.shift ? params.end : undefined, params.method);
      if (id !== requestId.current) return; // resposta antiga, ignora
      setData(next);
      setApplied(params);
    } catch (e) {
      if (id !== requestId.current) return;
      setError(errorMessage(e));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => { void load({ date: today(), shift: false, start: "06:00", end: "12:30", method: "all" }); }, [load]);

  const generate = () => load({ date, shift, start, end, method });
  const selectMethod = (next: string) => {
    if (next === method) return;
    setMethod(next);
    // com extrato na tela, troca a forma de pagamento mantendo o período exibido
    if (applied) void load({ ...applied, method: next });
  };

  const methods: { method: string; label: string; order_count?: number; total_revenue?: number }[] = data?.payment_methods ?? DEFAULT_METHODS;
  const activeLabel = DEFAULT_METHODS.find((m) => m.method === (applied?.method ?? "all"))?.label ?? "Todos";
  const filtered = !!applied && applied.method !== "all";

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
          <Button onClick={generate} disabled={loading || !date || (shift && (!start || !end))}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Gerar extrato
          </Button>
          {data && applied && <ReportExportButton
            filename={filtered ? `extrato-itens-${applied.method}` : "extrato-itens"}
            headers={["Item", "Forma de pagamento", "Quantidade", "Valor"]}
            rows={data.items.flatMap((item) => item.payments.map((payment) => [item.name, payment.label, quantity(payment.quantity, item.unit), money(payment.revenue)]))}
            summaryData={{ "Forma de pagamento": activeLabel, "Pedidos pagos": data.summary.order_count, "Itens após ajustes": money(data.summary.item_revenue), "Taxas de entrega": money(data.summary.delivery_fees), "Total recebido": money(data.summary.total_revenue) }}
            disabled={loading}
          />}
        </CardContent>
      </Card>

      <div role="group" aria-label="Forma de pagamento" className="flex flex-wrap gap-2">
        {methods.map((m) => {
          const active = method === m.method;
          const { order_count: count, total_revenue: total } = m;
          return (
            <button
              key={m.method}
              type="button"
              aria-pressed={active}
              disabled={loading}
              onClick={() => selectMethod(m.method)}
              className={cn(
                "flex min-h-11 flex-col items-start rounded-lg border px-3 py-1.5 text-left text-sm transition-colors disabled:opacity-60",
                active ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:bg-muted",
              )}
            >
              <span className="flex items-center gap-1.5 font-medium"><CreditCard className="h-3.5 w-3.5 shrink-0" />{m.label}</span>
              {count !== undefined && total !== undefined && <span className={cn("text-xs", active ? "text-primary-foreground/80" : "text-muted-foreground")}>{count} {count === 1 ? "pedido" : "pedidos"} · {money(total)}</span>}
            </button>
          );
        })}
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {data && applied && <div className={cn("space-y-5 transition-opacity", loading && "opacity-60")} aria-busy={loading}>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {applied.shift ? <Clock3 className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
          {applied.shift ? `Turno das ${applied.start} às ${applied.end}` : "Dia completo"} · {new Date(`${applied.date}T12:00:00`).toLocaleDateString("pt-BR")} · {activeLabel}
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
          <CardHeader><CardTitle className="font-tomato">{filtered ? `Itens pagos em ${activeLabel}` : "Itens por forma de pagamento"}</CardTitle></CardHeader>
          <CardContent>
            {data.items.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">{filtered ? `Nenhum pedido pago em ${activeLabel} neste período.` : "Nenhum pedido pago neste período."}</p> : <div className="divide-y">
              {data.items.map((item) => <section key={`${item.name}-${item.unit}`} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="break-words font-semibold">{item.name}</h3><span className="text-sm text-muted-foreground">{quantity(item.quantity, item.unit)} · {money(item.revenue)}</span></div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {item.payments.map((payment) => <div key={payment.method} className="flex justify-between gap-3 rounded-md bg-muted/40 px-3 py-2 text-sm"><span>{payment.label} <span className="text-muted-foreground">· {quantity(payment.quantity, item.unit)}</span></span><strong>{money(payment.revenue)}</strong></div>)}
                </div>
              </section>)}
            </div>}
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">Os valores de cada item incluem a parcela proporcional dos descontos e acréscimos do pedido.</p>
      </div>}
    </div>
  );
}
