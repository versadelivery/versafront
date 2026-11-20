"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Loader2, Plus, Printer, Trash2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReportExportButton from "@/components/admin/report-export-button";
import { cn } from "@/lib/utils";
import { reportsService, StatementPaymentGroup, StatementPeriod, StatementResponse } from "../services/reports-service";

const today = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`; };
const shiftDays = (date: string, days: number) => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate()+days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const money = (v: number) => new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(v);
const quantity = (v: number, unit: string) => `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits:3 }).format(v)} ${unit}`;
const METHOD_FILTERS = [["all", "Todos"], ["cash", "Dinheiro"], ["pix", "Pix"], ["credit", "Crédito"], ["debit", "Débito"], ["food_voucher", "Vale"]] as const;
const brDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");
const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

function Time24Select({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [hour = "00", minute = "00"] = value.split(":");
  const parts = [
    { label: "Hora", value: hour, values: Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")), set: (v: string) => onChange(`${v}:${minute}`) },
    { label: "Minuto", value: minute, values: Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")), set: (v: string) => onChange(`${hour}:${v}`) },
  ];
  return <div className="grid gap-1.5 text-sm font-medium"><span>{label}</span><div className="flex items-center gap-1">
    {parts.map(part => <Select key={part.label} value={part.value} onValueChange={part.set}>
      <SelectTrigger aria-label={`${label}: ${part.label}`} className="h-10 w-[76px] rounded-md bg-background px-2 font-mono"><SelectValue /></SelectTrigger>
      <SelectContent className="max-h-60">{part.values.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
    </Select>)}
    </div></div>;
}

export default function StatementTab() {
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
        <select className="h-10 rounded-md border border-input bg-background px-3" value={preset} onChange={e=>updatePreset(e.target.value)}>
          <option value="today">Hoje</option><option value="7">Últimos 7 dias</option><option value="15">Últimos 15 dias</option><option value="custom">Personalizado</option>
        </select>
      </label>
      {preset === "custom" && <>
        <label className="grid gap-1.5 text-sm font-medium">De<input className="h-10 rounded-md border border-input bg-background px-3" type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} /></label>
        <label className="grid gap-1.5 text-sm font-medium">Até<input className="h-10 rounded-md border border-input bg-background px-3" type="date" value={endDate} min={startDate} onChange={e=>setEndDate(e.target.value)} /></label>
      </>}
      <label className="grid gap-1.5 text-sm font-medium">Turno
        <select className="h-10 min-w-44 rounded-md border border-input bg-background px-3" value={selected} onChange={e=>setSelected(e.target.value)}>
          <option value="all">Dia completo</option>{periods.map(p=><option key={p.id} value={p.id}>{p.name} ({p.start_time}–{p.end_time})</option>)}<option value="custom">Horário personalizado…</option>
        </select>
      </label>
      {selected === "custom" && <><Time24Select label="Das" value={customStart} onChange={setCustomStart}/><Time24Select label="Até" value={customEnd} onChange={setCustomEnd}/></>}
      <Button variant="outline" onClick={()=>setManage(!manage)}><Settings2 className="mr-2 h-4 w-4"/>Gerenciar turnos</Button>
      {loading && <span className="flex h-10 items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Atualizando extrato</span>}
      {data && <Button variant="outline" size="sm" onClick={()=>window.print()} disabled={loading}><Printer className="mr-2 h-4 w-4"/>Imprimir</Button>}
      {data && <ReportExportButton filename="extrato-por-pagamento" headers={["Pagamento","Item","Quantidade","Preço unitário","Total"]} rows={data.payment_groups.flatMap(group=>group.items.map(item=>[group.label,item.name,quantity(item.quantity,item.unit),money(item.unit_price),money(item.revenue)]))} summaryData={Object.fromEntries(data.payment_groups.flatMap(group=>[[`${group.label} · vendas`,group.order_count],[`${group.label} · valor total`,money(group.total_revenue)],[`${group.label} · ticket médio`,money(group.average_ticket)]]))} disabled={loading}/>}
    </CardContent>
    {manage && <CardContent className="border-t pt-4"><CardTitle className="mb-3 text-base">Turnos salvos nesta loja</CardTitle>
      <div className="mb-4 space-y-2">{periods.length===0 && <p className="text-sm text-muted-foreground">Nenhum turno cadastrado.</p>}{periods.map(p=><div key={p.id} className="flex items-center justify-between border-b py-2 text-sm"><span>{p.name} · {p.start_time}–{p.end_time}</span><Button variant="ghost" size="sm" disabled={saving} aria-label={`Remover ${p.name}`} onClick={()=>savePeriods(periods.filter(x=>x.id!==p.id))}><Trash2 className="h-4 w-4"/></Button></div>)}</div>
      <div className="flex flex-wrap items-end gap-3"><label className="grid gap-1 text-sm">Nome<input className="h-10 rounded-md border border-input bg-background px-3" value={draftName} maxLength={40} placeholder="Almoço" onChange={e=>setDraftName(e.target.value)}/></label><Time24Select label="Início" value={draftStart} onChange={setDraftStart}/><Time24Select label="Fim" value={draftEnd} onChange={setDraftEnd}/><Button variant="outline" onClick={addPeriod} disabled={saving || !draftName.trim() || draftStart===draftEnd}><Plus className="mr-2 h-4 w-4"/>Adicionar turno</Button></div>
    </CardContent>}
    </Card>
    {error && <p role="alert" className="text-sm text-red-600 print:hidden">{error}</p>}
    {invalidCustom && <p role="alert" className="text-sm text-red-600 print:hidden">O horário inicial e o final precisam ser diferentes.</p>}
    <div className="flex flex-wrap gap-2 print:hidden" role="radiogroup" aria-label="Forma de pagamento">
      {METHOD_FILTERS.map(([value,label])=>{ const active = method===value; const count = data?.payment_methods.find(m=>m.method===value)?.order_count; return <button key={value} type="button" role="radio" aria-checked={active} onClick={()=>setMethod(value)} className={cn("h-9 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors", active ? "border-primary bg-primary text-white" : "border-input bg-background text-muted-foreground hover:bg-muted")}>{label}{count!==undefined && <span className={cn("ml-1.5 text-xs", active ? "text-white/80" : "text-muted-foreground")}>{count}</span>}</button>; })}
    </div>
    {data && <div id="extrato-print" className={cn("space-y-4", loading && "opacity-60")}>
      <div>
        <h2 className="font-tomato text-xl font-bold">Extrato {startDate===endDate?`dia ${brDate(startDate)}`:`de ${brDate(startDate)} a ${brDate(endDate)}`}</h2>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">{selectedPeriod?<Clock3 className="h-4 w-4"/>:<CalendarDays className="h-4 w-4"/>}{selectedPeriod?`De ${selectedPeriod.start_time} às ${selectedPeriod.end_time}`:"Dia completo (00:00 às 23:59)"}{method!=="all" && ` · ${METHOD_FILTERS.find(([v])=>v===method)?.[1]}`}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{[["Vendas",String(data.summary.order_count)],["Total recebido",money(data.summary.total_revenue)],["Ticket médio",money(data.summary.order_count?data.summary.total_revenue/data.summary.order_count:0)],["Taxas de entrega",money(data.summary.delivery_fees)]].map(([label,value])=><Card key={label}><CardContent className="px-4 pt-4"><p className="text-xs text-muted-foreground sm:text-sm">{label}</p><p className="mt-1 text-lg font-semibold sm:text-xl">{value}</p></CardContent></Card>)}</div>
      <div className="grid gap-4 lg:grid-cols-2 print:grid-cols-1">{data.payment_groups.map(group=><PaymentGroupCard key={group.method} group={group}/>)}</div>
      <p className="text-xs text-muted-foreground">Preço unitário = média do período, já com a parcela proporcional de descontos e acréscimos. Pedidos cancelados e não pagos ficam de fora.</p>
    </div>}
  </div>;
}

function PaymentGroupCard({ group }: { group: StatementPaymentGroup }) {
  const empty = group.order_count === 0;
  return <Card className="break-inside-avoid gap-0 overflow-hidden py-0" data-testid={`group-${group.method}`}>
    <CardHeader className="flex flex-row items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3"><CardTitle className="font-tomato text-base">{group.label}</CardTitle><span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border">{group.order_count} {group.order_count===1?"venda":"vendas"}</span></CardHeader>
    <CardContent className="px-4 py-3">{empty?<p className="py-3 text-center text-sm text-muted-foreground">Sem vendas neste período.</p>:<>
      <ul className="divide-y">{group.items.map(item=><li key={`${item.name}-${item.unit}`} className="flex items-start justify-between gap-3 py-2 text-sm"><span className="min-w-0"><span className="font-medium">{item.name}</span><span className="block text-xs text-muted-foreground">{quantity(item.quantity,item.unit)} × {money(item.unit_price)}</span></span><span className="shrink-0 font-semibold tabular-nums">{money(item.revenue)}</span></li>)}</ul>
      <dl className="mt-2 space-y-1 border-t pt-3 text-sm">
        {group.delivery_fees>0 && <><div className="flex justify-between"><dt className="text-muted-foreground">Itens</dt><dd className="tabular-nums">{money(group.items_total)}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Taxas de entrega</dt><dd className="tabular-nums">{money(group.delivery_fees)}</dd></div></>}
        <div className="flex justify-between text-base font-bold"><dt>Valor total</dt><dd className="tabular-nums">{money(group.total_revenue)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Ticket médio</dt><dd className="font-medium tabular-nums">{money(group.average_ticket)}</dd></div>
      </dl></>}</CardContent>
  </Card>;
}
