"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Loader2, Plus, Printer, Trash2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReportExportButton from "@/components/admin/report-export-button";
import { cn } from "@/lib/utils";
import { reportsService, StatementPaymentGroup, StatementPeriod, StatementResponse } from "../services/reports-service";

const today = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`; };
const shiftDays = (date: string, days: number) => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate()+days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const money = (v: number) => new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(v);
const quantity = (v: number, unit: string) => `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits:3 }).format(v)} ${unit}`;
const METHOD_FILTERS = [["all", "Todos"], ["cash", "Dinheiro"], ["pix", "Pix"], ["credit", "Crédito"], ["debit", "Débito"], ["food_voucher", "Vale"], ["store_credit", "Fiado"], ["split", "Dividido"]] as const;
const brDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");
const emittedAt = () => new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }).replace(",", " às");
const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

function Time24Select({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [hour = "00", minute = "00"] = value.split(":");
  const parts = [
    { label: "Hora", value: hour, values: Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")), set: (v: string) => onChange(`${v}:${minute}`) },
    { label: "Minuto", value: minute, values: Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")), set: (v: string) => onChange(`${hour}:${v}`) },
  ];
  return <div className="grid gap-1.5 text-sm font-medium"><span>{label}</span><div className="flex items-center gap-1">
    {parts.map(part => <Select key={part.label} value={part.value} onValueChange={part.set}>
      <SelectTrigger aria-label={`${label}: ${part.label}`} className="h-10 data-[size=default]:h-10 w-[76px] rounded-md border-slate-500 bg-background px-2 font-mono hover:border-slate-600"><SelectValue /></SelectTrigger>
      <SelectContent className="max-h-60">{part.values.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
    </Select>)}
    </div></div>;
}

export interface StatementFooterContext { method: string; startDate: string; endDate: string }

export default function StatementTab({ footer }: { footer?: (ctx: StatementFooterContext) => ReactNode } = {}) {
  const [preset, setPreset] = useState("today");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [selected, setSelected] = useState("all");
  const [method, setMethod] = useState<string>("all");
  const [customStart, setCustomStart] = useState("05:30");
  const [customEnd, setCustomEnd] = useState("11:30");
  const [periods, setPeriods] = useState<StatementPeriod[]>([]);
  const [manage, setManage] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftStart, setDraftStart] = useState("06:00");
  const [draftEnd, setDraftEnd] = useState("12:30");
  const [data, setData] = useState<StatementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { reportsService.getStatementPeriods().then(setPeriods).catch(() => setError("Não foi possível carregar os turnos salvos.")); }, []);
  const updatePreset = (value: string) => {
    setPreset(value);
    const end = today();
    if (value === "today") { setStartDate(end); setEndDate(end); }
    if (value === "7") { setStartDate(shiftDays(end,-6)); setEndDate(end); }
    if (value === "15") { setStartDate(shiftDays(end,-14)); setEndDate(end); }
  };
  const saved = periods.find(p => p.id === selected);
  const selectedPeriod = selected === "custom" ? { id: "custom", name: "Horário personalizado", start_time: customStart, end_time: customEnd } : saved;
  const invalidCustom = selected === "custom" && customStart === customEnd;
  useEffect(() => {
    if (!startDate || !endDate || endDate < startDate || invalidCustom) return;
    let active = true;
    setLoading(true); setError(null);
    reportsService.getStatement(startDate, selectedPeriod?.start_time, selectedPeriod?.end_time, method, endDate)
      .then(result => { if (active) setData(result); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "Não foi possível carregar o extrato."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [startDate, endDate, selected, periods, method, customStart, customEnd]);
  const savePeriods = async (next: StatementPeriod[]) => {
    setSaving(true); setError(null);
    try { setPeriods(await reportsService.saveStatementPeriods(next)); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível salvar os turnos."); }
    finally { setSaving(false); }
  };
  const addPeriod = async () => {
    if (!draftName.trim() || draftStart === draftEnd) return;
    const next = [...periods, { id:id(), name:draftName.trim(), start_time:draftStart, end_time:draftEnd }];
    await savePeriods(next); setDraftName("");
  };

  return <div className="space-y-5 pt-4">
    <style>{`@media print{body *{visibility:hidden!important}#extrato-print,#extrato-print *{visibility:visible!important}#extrato-print{position:absolute;left:0;top:0;width:100%;padding:0 8px}@page{margin:12mm}}`}</style>
    <Card className="print:hidden"><CardContent className="flex flex-wrap items-end gap-4 pt-6">
      <label className="grid gap-1.5 text-sm font-medium">Período de datas
        <select className="h-10 rounded-md border border-slate-500 bg-background px-3 shadow-xs hover:border-slate-600" value={preset} onChange={e=>updatePreset(e.target.value)}>
          <option value="today">Hoje</option><option value="7">Últimos 7 dias</option><option value="15">Últimos 15 dias</option><option value="custom">Personalizado</option>
        </select>
      </label>
      {preset === "custom" && <>
        <label className="grid gap-1.5 text-sm font-medium">De<input className="h-10 rounded-md border border-slate-500 bg-background px-3 shadow-xs hover:border-slate-600" type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} /></label>
        <label className="grid gap-1.5 text-sm font-medium">Até<input className="h-10 rounded-md border border-slate-500 bg-background px-3 shadow-xs hover:border-slate-600" type="date" value={endDate} min={startDate} onChange={e=>setEndDate(e.target.value)} /></label>
      </>}
      <label className="grid gap-1.5 text-sm font-medium">Turno
        <select className="h-10 min-w-44 rounded-md border border-slate-500 bg-background px-3 shadow-xs hover:border-slate-600" value={selected} onChange={e=>setSelected(e.target.value)}>
          <option value="all">Dia completo</option>{periods.map(p=><option key={p.id} value={p.id}>{p.name} ({p.start_time}–{p.end_time})</option>)}<option value="custom">Horário personalizado…</option>
        </select>
      </label>
      {selected === "custom" && <><Time24Select label="Das" value={customStart} onChange={setCustomStart}/><Time24Select label="Até" value={customEnd} onChange={setCustomEnd}/></>}
      <Button variant="outline" onClick={()=>setManage(!manage)}><Settings2 className="mr-2 h-4 w-4"/>Gerenciar turnos</Button>
      {loading && <span className="flex h-10 items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Atualizando extrato</span>}
      {data && <Button variant="outline" size="sm" onClick={()=>window.print()} disabled={loading}><Printer className="mr-2 h-4 w-4"/>Imprimir</Button>}
      {data && <ReportExportButton filename="extrato-por-pagamento" headers={["Pagamento","Item","Quantidade","Preço unitário","Total"]} rows={data.payment_groups.flatMap(group=>[...group.items.map(item=>[group.label,item.name,quantity(item.quantity,item.unit),money(item.unit_price),money(item.revenue)]),...group.delivery_fee_items.map(fee=>[group.label,"Taxa de entrega",`${fee.count} un.`,money(fee.amount),money(fee.total)]),...group.payment_breakdown.map(part=>[group.label,`Recebido em ${part.label}`,"","",money(part.amount)])])} summaryData={Object.fromEntries(data.payment_groups.flatMap(group=>[[`${group.label} · vendas`,group.order_count],[`${group.label} · valor total`,money(group.total_revenue)],[`${group.label} · ticket médio`,money(group.average_ticket)]]))} disabled={loading}/>}
    </CardContent>
    {manage && <CardContent className="border-t pt-4"><CardTitle className="mb-3 text-base">Turnos salvos nesta loja</CardTitle>
      <div className="mb-4 space-y-2">{periods.length===0 && <p className="text-sm text-muted-foreground">Nenhum turno cadastrado.</p>}{periods.map(p=><div key={p.id} className="flex items-center justify-between border-b py-2 text-sm"><span>{p.name} · {p.start_time}–{p.end_time}</span><Button variant="ghost" size="sm" disabled={saving} aria-label={`Remover ${p.name}`} onClick={()=>savePeriods(periods.filter(x=>x.id!==p.id))}><Trash2 className="h-4 w-4"/></Button></div>)}</div>
      <div className="flex flex-wrap items-end gap-3"><label className="grid gap-1 text-sm">Nome<input className="h-10 rounded-md border border-slate-500 bg-background px-3 shadow-xs hover:border-slate-600" value={draftName} maxLength={40} placeholder="Almoço" onChange={e=>setDraftName(e.target.value)}/></label><Time24Select label="Início" value={draftStart} onChange={setDraftStart}/><Time24Select label="Fim" value={draftEnd} onChange={setDraftEnd}/><Button variant="outline" onClick={addPeriod} disabled={saving || !draftName.trim() || draftStart===draftEnd}><Plus className="mr-2 h-4 w-4"/>Adicionar turno</Button></div>
    </CardContent>}
    </Card>
    {error && <p role="alert" className="text-sm text-red-600 print:hidden">{error}</p>}
    {invalidCustom && <p role="alert" className="text-sm text-red-600 print:hidden">O horário inicial e o final precisam ser diferentes.</p>}
    <div className="flex flex-wrap gap-2 print:hidden" role="radiogroup" aria-label="Forma de pagamento">
      {METHOD_FILTERS.map(([value,label])=>{ const active = method===value; const count = data?.payment_methods.find(m=>m.method===value)?.order_count; return <button key={value} type="button" role="radio" aria-checked={active} onClick={()=>setMethod(value)} className={cn("h-9 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors", active ? "border-primary bg-primary text-white" : "border-slate-500 bg-background text-muted-foreground hover:bg-muted")}>{label}{count!==undefined && <span className={cn("ml-1.5 text-xs", active ? "text-white/80" : "text-muted-foreground")}>{count}</span>}</button>; })}
    </div>
    {data && <div id="extrato-print" className={cn("mx-auto w-full max-w-3xl overflow-hidden rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none", loading && "opacity-60")}>
      <header className="border-b-2 border-slate-800 px-4 pb-4 pt-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Extrato de vendas</p>
            <h2 className="mt-1 font-tomato text-xl font-bold sm:text-2xl">Extrato {startDate===endDate?`dia ${brDate(startDate)}`:`de ${brDate(startDate)} a ${brDate(endDate)}`}</h2>
          </div>
          <p className="shrink-0 text-right text-[11px] leading-tight text-slate-500">Emitido em<br/><span className="font-medium text-slate-700">{emittedAt()}</span></p>
        </div>
        <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <div className="flex gap-2"><dt className="text-slate-500">Período:</dt><dd className="font-medium">{startDate===endDate?brDate(startDate):`${brDate(startDate)} a ${brDate(endDate)}`}</dd></div>
          <div className="flex gap-2"><dt className="text-slate-500">Horário:</dt><dd className="font-medium">{selectedPeriod?`De ${selectedPeriod.start_time} às ${selectedPeriod.end_time}`:"Dia completo (00:00 às 23:59)"}</dd></div>
          <div className="flex gap-2"><dt className="text-slate-500">Pagamento:</dt><dd className="font-medium">{method==="all"?"Todos":METHOD_FILTERS.find(([v])=>v===method)?.[1]}</dd></div>
          <div className="flex gap-2"><dt className="text-slate-500">Vendas:</dt><dd className="font-medium">{data.summary.order_count}</dd></div>
        </dl>
      </header>

      <section className="border-b border-slate-300 px-4 py-4 sm:px-6" aria-label="Resumo geral">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Resumo geral</h3>
        <div className={cn(ROW, "border-b border-slate-300 pb-1 text-[11px] font-semibold uppercase text-slate-500", "grid-cols-[1fr_auto_auto]", "sm:grid-cols-[1fr_70px_110px_110px]")}><span>Pagamento</span><span className="hidden text-right sm:block">Vendas</span><span className="text-right">Total</span><span className="hidden text-right sm:block">Ticket médio</span></div>
        {data.payment_groups.map(g=><div key={g.method} className={cn(ROW, "grid-cols-[1fr_auto] border-b border-dashed border-slate-200 py-1.5 text-sm sm:grid-cols-[1fr_70px_110px_110px]")}><span>{g.label}<span className="block text-[11px] text-slate-500 sm:hidden">{g.order_count} {g.order_count===1?"venda":"vendas"} · ticket {money(g.average_ticket)}</span></span><span className="hidden text-right tabular-nums sm:block">{g.order_count}</span><span className="text-right font-medium tabular-nums">{money(g.total_revenue)}</span><span className="hidden text-right tabular-nums sm:block">{money(g.average_ticket)}</span></div>)}
        <div className={cn(ROW, "grid-cols-[1fr_auto] pt-2 text-sm font-bold sm:grid-cols-[1fr_70px_110px_110px]")}><span>Total geral</span><span className="hidden text-right tabular-nums sm:block">{data.summary.order_count}</span><span className="text-right tabular-nums">{money(data.summary.total_revenue)}</span><span className="hidden text-right tabular-nums sm:block">{money(data.summary.order_count?data.summary.total_revenue/data.summary.order_count:0)}</span></div>
      </section>

      {data.payment_groups.map(group=><PaymentGroupCard key={group.method} group={group}/>)}

      <footer className="bg-slate-50 px-4 py-3 text-[11px] leading-snug text-slate-500 sm:px-6">Preço unitário = média do período, já com a parcela proporcional de descontos e acréscimos. Pedidos cancelados e não pagos ficam de fora. Ticket médio = valor total ÷ nº de vendas.</footer>
    </div>}
    {footer?.({ method, startDate, endDate })}
  </div>;
}

const ROW = "grid items-baseline gap-x-3";
const COLS = "grid-cols-[1fr_auto] sm:grid-cols-[1fr_90px_100px_110px]";

function PaymentGroupCard({ group }: { group: StatementPaymentGroup }) {
  const empty = group.order_count === 0;
  return <section className="break-inside-avoid border-b border-slate-300 px-4 py-4 last:border-b-0 sm:px-6" data-testid={`group-${group.method}`}>
    <div className="mb-2 flex items-baseline justify-between gap-2 border-b-2 border-slate-800 pb-1">
      <h3 className="font-tomato text-base font-bold uppercase tracking-wide">{group.label}</h3>
      <span className="text-xs font-medium text-slate-600">{group.order_count} {group.order_count===1?"venda":"vendas"}</span>
    </div>
    {empty?<p className="py-3 text-center text-sm text-slate-500">Sem vendas neste período.</p>:<>
      <div className={cn(ROW, COLS, "pb-1 text-[11px] font-semibold uppercase text-slate-500")}><span>Descrição</span><span className="hidden text-right sm:block">Qtd.</span><span className="hidden text-right sm:block">Preço unit.</span><span className="text-right">Total</span></div>
      {group.items.map(item=><div key={`${item.name}-${item.unit}`} className={cn(ROW, COLS, "border-b border-dashed border-slate-200 py-1.5 text-sm")}>
        <span className="min-w-0">{item.name}<span className="block text-[11px] text-slate-500 sm:hidden">{quantity(item.quantity,item.unit)} × {money(item.unit_price)}</span></span>
        <span className="hidden text-right tabular-nums sm:block">{quantity(item.quantity,item.unit)}</span><span className="hidden text-right tabular-nums sm:block">{money(item.unit_price)}</span>
        <span className="text-right font-medium tabular-nums">{money(item.revenue)}</span></div>)}
      {group.delivery_fee_items.map(fee=><div key={fee.amount} data-testid="delivery-fee-row" className={cn(ROW, COLS, "border-b border-dashed border-slate-200 py-1.5 text-sm")}>
        <span className="min-w-0">{fee.count} {fee.count===1?"taxa":"taxas"} de entrega<span className="block text-[11px] text-slate-500 sm:hidden">{fee.count} × {money(fee.amount)}</span></span>
        <span className="hidden text-right tabular-nums sm:block">{fee.count} un.</span><span className="hidden text-right tabular-nums sm:block">{money(fee.amount)}</span>
        <span className="text-right font-medium tabular-nums">{money(fee.total)}</span></div>)}
      <div className={cn(ROW, COLS, "mt-2 border-t-2 border-slate-800 pt-2 text-base font-bold")}><span className="sm:col-span-3">Valor total</span><span className="text-right tabular-nums">{money(group.total_revenue)}</span></div>
      <div className={cn(ROW, COLS, "pt-0.5 text-sm text-slate-600")}><span className="sm:col-span-3">Ticket médio</span><span className="text-right font-medium tabular-nums">{money(group.average_ticket)}</span></div>
      {group.payment_breakdown.length>0&&<div className="mt-3 rounded border border-slate-300 px-3 py-2" data-testid="split-breakdown">
        <p className="mb-1 text-[11px] font-semibold uppercase text-slate-500">Recebido em cada forma de pagamento</p>
        {group.payment_breakdown.map(part=><div key={part.method} className="flex justify-between gap-3 py-0.5 text-sm"><span>{part.label}</span><span className="font-medium tabular-nums">{money(part.amount)}</span></div>)}
      </div>}
    </>}
  </section>;
}
