"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Loader2, Plus, Trash2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReportExportButton from "@/components/admin/report-export-button";
import { reportsService, StatementPeriod, StatementResponse } from "../services/reports-service";

const today = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`; };
const shiftDays = (date: string, days: number) => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate()+days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const money = (v: number) => new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(v);
const quantity = (v: number, unit: string) => `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits:3 }).format(v)} ${unit}`;
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
  const selectedPeriod = periods.find(p => p.id === selected);
  useEffect(() => {
    if (!startDate || !endDate || endDate < startDate) return;
    let active = true;
    setLoading(true); setError(null);
    reportsService.getStatement(startDate, selectedPeriod?.start_time, selectedPeriod?.end_time, undefined, endDate)
      .then(result => { if (active) setData(result); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "Não foi possível carregar o extrato."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [startDate, endDate, selected, periods]);
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
    <Card><CardContent className="flex flex-wrap items-end gap-4 pt-6">
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
          <option value="all">Dia completo</option>{periods.map(p=><option key={p.id} value={p.id}>{p.name} ({p.start_time}–{p.end_time})</option>)}
        </select>
      </label>
      <Button variant="outline" onClick={()=>setManage(!manage)}><Settings2 className="mr-2 h-4 w-4"/>Gerenciar turnos</Button>
      {loading && <span className="flex h-10 items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Atualizando extrato</span>}
      {data && <ReportExportButton filename="extrato-itens" headers={["Item","Forma de pagamento","Quantidade","Valor"]} rows={data.items.flatMap(item=>item.payments.map(payment=>[item.name,payment.label,quantity(payment.quantity,item.unit),money(payment.revenue)]))} disabled={loading}/>}
    </CardContent>
    {manage && <CardContent className="border-t pt-4"><CardTitle className="mb-3 text-base">Turnos salvos nesta loja</CardTitle>
      <div className="mb-4 space-y-2">{periods.length===0 && <p className="text-sm text-muted-foreground">Nenhum turno cadastrado.</p>}{periods.map(p=><div key={p.id} className="flex items-center justify-between border-b py-2 text-sm"><span>{p.name} · {p.start_time}–{p.end_time}</span><Button variant="ghost" size="sm" disabled={saving} aria-label={`Remover ${p.name}`} onClick={()=>savePeriods(periods.filter(x=>x.id!==p.id))}><Trash2 className="h-4 w-4"/></Button></div>)}</div>
      <div className="flex flex-wrap items-end gap-3"><label className="grid gap-1 text-sm">Nome<input className="h-10 rounded-md border border-input bg-background px-3" value={draftName} maxLength={40} placeholder="Almoço" onChange={e=>setDraftName(e.target.value)}/></label><Time24Select label="Início" value={draftStart} onChange={setDraftStart}/><Time24Select label="Fim" value={draftEnd} onChange={setDraftEnd}/><Button variant="outline" onClick={addPeriod} disabled={saving || !draftName.trim() || draftStart===draftEnd}><Plus className="mr-2 h-4 w-4"/>Adicionar turno</Button></div>
    </CardContent>}
    </Card>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {data && <>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">{selectedPeriod?<Clock3 className="h-4 w-4"/>:<CalendarDays className="h-4 w-4"/>}{selectedPeriod?`${selectedPeriod.name} ${selectedPeriod.start_time}–${selectedPeriod.end_time}`:"Dia completo"} · {startDate===endDate?new Date(`${startDate}T12:00:00`).toLocaleDateString("pt-BR"):`${new Date(`${startDate}T12:00:00`).toLocaleDateString("pt-BR")} a ${new Date(`${endDate}T12:00:00`).toLocaleDateString("pt-BR")}`}</div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Pedidos pagos",String(data.summary.order_count)],["Itens após ajustes",money(data.summary.item_revenue)],["Taxas de entrega",money(data.summary.delivery_fees)],["Total recebido",money(data.summary.total_revenue)]].map(([label,value])=><Card key={label}><CardContent className="pt-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></CardContent></Card>)}</div>
      <Card><CardHeader><CardTitle className="font-tomato">Itens por forma de pagamento</CardTitle></CardHeader><CardContent>{data.items.length===0?<p className="py-8 text-center text-sm text-muted-foreground">Nenhum pedido pago neste período.</p>:<div className="divide-y">{data.items.map(item=><section key={item.name} className="py-4 first:pt-0 last:pb-0"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-semibold">{item.name}</h3><span className="text-sm text-muted-foreground">{quantity(item.quantity,item.unit)} · {money(item.revenue)}</span></div><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{item.payments.map(payment=><div key={payment.method} className="flex justify-between gap-3 rounded-md bg-muted/40 px-3 py-2 text-sm"><span>{payment.label} <span className="text-muted-foreground">· {quantity(payment.quantity,item.unit)}</span></span><strong>{money(payment.revenue)}</strong></div>)}</div></section>)}</div>}</CardContent></Card>
      <p className="text-xs text-muted-foreground">Os valores incluem a parcela proporcional dos descontos e acréscimos do pedido.</p>
    </>}
  </div>;
}
