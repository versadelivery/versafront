"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, Info, Loader2, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useShop } from "@/hooks/use-shop";
import { cn } from "@/lib/utils";
import { SCHEDULING_MODE_OPTIONS, type SchedulingMode } from "@/lib/scheduling";

const LEAD_OPTIONS = [
  { value: 30, label: "30 minutos" },
  { value: 60, label: "1 hora" },
  { value: 120, label: "2 horas" },
  { value: 180, label: "3 horas" },
  { value: 360, label: "6 horas" },
  { value: 720, label: "12 horas" },
  { value: 1440, label: "24 horas" },
];
const MAX_DAYS_OPTIONS = [1, 2, 3, 5, 7, 10, 14, 21, 30];
const SLOT_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120];

interface FormState {
  scheduling_mode: SchedulingMode;
  scheduling_min_lead_minutes: number;
  scheduling_max_days: number;
  scheduling_slot_minutes: number;
}

const DEFAULTS: FormState = {
  scheduling_mode: "disabled",
  scheduling_min_lead_minutes: 30,
  scheduling_max_days: 7,
  scheduling_slot_minutes: 30,
};

const leadLabel = (minutes: number) => LEAD_OPTIONS.find((o) => o.value === minutes)?.label ?? `${minutes} minutos`;
const dayLabel = (days: number) => (days === 1 ? "1 dia" : `${days} dias`);

export default function SchedulingSettingsPage() {
  const { shop, isLoading, updateShop, isUpdating } = useShop();
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [initial, setInitial] = useState<FormState>(DEFAULTS);

  useEffect(() => {
    if (!shop) return;
    const loaded: FormState = {
      scheduling_mode: shop.scheduling_mode ?? DEFAULTS.scheduling_mode,
      scheduling_min_lead_minutes: shop.scheduling_min_lead_minutes ?? DEFAULTS.scheduling_min_lead_minutes,
      scheduling_max_days: shop.scheduling_max_days ?? DEFAULTS.scheduling_max_days,
      scheduling_slot_minutes: shop.scheduling_slot_minutes ?? DEFAULTS.scheduling_slot_minutes,
    };
    setForm(loaded);
    setInitial(loaded);
  }, [shop]);

  const enabled = form.scheduling_mode !== "disabled";
  const hasChanges = JSON.stringify(form) !== JSON.stringify(initial);
  const leadTooLong = form.scheduling_min_lead_minutes >= form.scheduling_max_days * 1440;

  const save = () => {
    if (leadTooLong) return;
    updateShop(form);
  };

  const header = (
    <div className="bg-white border-b border-[#E5E2DD] sticky top-0 z-30">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link href="/admin/settings" className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:block">Voltar</span>
            </Link>
            <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
            <h1 className="truncate font-tomato text-sm sm:text-lg font-bold text-gray-900">Agendamento</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              type="button"
              disabled={!hasChanges || isUpdating}
              onClick={() => setForm(initial)}
              className="rounded-md border border-gray-300 cursor-pointer text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!hasChanges || isUpdating || leadTooLong}
              onClick={save}
              className="rounded-md border border-gray-300 cursor-pointer bg-primary text-white hover:bg-primary/90 text-sm"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <span className="sm:hidden">Salvar</span>
                  <span className="hidden sm:inline">Salvar alterações</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7]">
        {header}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          <Skeleton className="h-52 w-full rounded-md" />
          <Skeleton className="h-40 w-full rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {header}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Quem pode agendar */}
        <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            <h2 className="font-tomato text-base font-semibold text-gray-900">Agendamento de pedidos</h2>
          </div>
          <div className="px-5 py-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              Permita que o cliente (no catálogo) e a sua equipe (PDV) agendem pedidos para outro dia ou horário, mesmo com a
              loja fechada. Por padrão o agendamento fica desligado.
            </p>
            <div role="radiogroup" aria-label="Tipos de pedido que podem ser agendados" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SCHEDULING_MODE_OPTIONS.map((option) => {
                const selected = form.scheduling_mode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-testid={`scheduling-mode-${option.value}`}
                    onClick={() => setForm((prev) => ({ ...prev, scheduling_mode: option.value }))}
                    className={cn(
                      "flex items-start gap-3 rounded-md border p-4 text-left transition-colors cursor-pointer",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      selected ? "border-primary bg-primary/5" : "border-[#E5E2DD] bg-white hover:border-primary/40"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        selected ? "border-primary" : "border-gray-300"
                      )}
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-900">{option.label}</span>
                      <span className="block text-sm text-muted-foreground">{option.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Janela e intervalo */}
        {enabled && (
          <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden" data-testid="scheduling-window">
            <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              <h2 className="font-tomato text-base font-semibold text-gray-900">Horários oferecidos</h2>
            </div>
            <div className="px-5 py-5 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="min-lead" className="text-sm font-medium">Antecedência mínima</Label>
                  <Select
                    value={String(form.scheduling_min_lead_minutes)}
                    onValueChange={(v) => setForm((prev) => ({ ...prev, scheduling_min_lead_minutes: Number(v) }))}
                  >
                    <SelectTrigger id="min-lead" className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Tempo mínimo entre agora e o horário agendado.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="max-days" className="text-sm font-medium">Antecedência máxima</Label>
                  <Select
                    value={String(form.scheduling_max_days)}
                    onValueChange={(v) => setForm((prev) => ({ ...prev, scheduling_max_days: Number(v) }))}
                  >
                    <SelectTrigger id="max-days" className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAX_DAYS_OPTIONS.map((d) => (
                        <SelectItem key={d} value={String(d)}>{dayLabel(d)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Até quantos dias à frente (máximo 30).</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="slot-minutes" className="text-sm font-medium">Intervalo entre horários</Label>
                  <Select
                    value={String(form.scheduling_slot_minutes)}
                    onValueChange={(v) => setForm((prev) => ({ ...prev, scheduling_slot_minutes: Number(v) }))}
                  >
                    <SelectTrigger id="slot-minutes" className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SLOT_OPTIONS.map((m) => (
                        <SelectItem key={m} value={String(m)}>{m} minutos</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">De quanto em quanto tempo aparece um horário.</p>
                </div>
              </div>

              {leadTooLong && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  A antecedência mínima precisa ser menor que a máxima.
                </p>
              )}

              <p className="rounded-md bg-[#FAF9F7] px-3 py-2 text-sm text-gray-700" data-testid="scheduling-preview">
                O cliente poderá agendar de {leadLabel(form.scheduling_min_lead_minutes).toLowerCase()} até{" "}
                {dayLabel(form.scheduling_max_days)} à frente, em horários de {form.scheduling_slot_minutes} em{" "}
                {form.scheduling_slot_minutes} minutos.
              </p>

              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Só aparecem horários dentro do{" "}
                  <Link href="/admin/settings/horarios" className="font-medium text-primary underline-offset-2 hover:underline">
                    horário de funcionamento
                  </Link>{" "}
                  da loja. O pagamento segue as mesmas regras do pedido normal e o preço vale o do dia da entrega: o total é
                  recalculado quando o pedido é liberado. O Pix online não está disponível em pedidos agendados.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
