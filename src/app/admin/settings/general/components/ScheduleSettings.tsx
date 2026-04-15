"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, AlertCircle, CopyCheck, ArrowDown } from "lucide-react";
import { useSchedule, WeekSchedule, DayKey } from "../hooks/useSchedule";

interface TimeInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function TimeInput({ id, value, onChange, disabled }: TimeInputProps) {
  const [hours, minutes] = (value || "00:00").split(":").map((v) => v.padStart(2, "0"));

  const handleHours = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    const clamped = Math.min(23, parseInt(raw || "0", 10)).toString().padStart(2, "0");
    onChange(`${clamped}:${minutes}`);
  };

  const handleMinutes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    const clamped = Math.min(59, parseInt(raw || "0", 10)).toString().padStart(2, "0");
    onChange(`${hours}:${clamped}`);
  };

  return (
    <div className="flex items-center h-9 rounded-md border border-[#E5E2DD] bg-white px-2 gap-0.5 w-full focus-within:ring-1 focus-within:ring-ring">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={hours}
        onChange={handleHours}
        disabled={disabled}
        className="w-6 text-center text-sm bg-transparent outline-none tabular-nums disabled:opacity-50"
        maxLength={2}
      />
      <span className="text-sm text-muted-foreground select-none">:</span>
      <input
        type="text"
        inputMode="numeric"
        value={minutes}
        onChange={handleMinutes}
        disabled={disabled}
        className="w-6 text-center text-sm bg-transparent outline-none tabular-nums disabled:opacity-50"
        maxLength={2}
      />
    </div>
  );
}

// Ordem dos dias da semana (domingo = 0, sábado = 6)
const DAYS_ORDER: DayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const DAY_LABELS: Record<DayKey, string> = {
  sunday: "Domingo",
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
};

interface ScheduleRowProps {
  dayKey: DayKey;
  schedule: WeekSchedule;
  onToggleActive: (day: DayKey, active: boolean) => void;
  onChangeTime: (day: DayKey, field: "open" | "close", value: string) => void;
  onCopyToAll: (day: DayKey) => void;
  onCopyDown: (day: DayKey) => void;
  isFirstDay: boolean;
  isLastDay: boolean;
}

function ScheduleRow({
  dayKey,
  schedule,
  onToggleActive,
  onChangeTime,
  onCopyToAll,
  onCopyDown,
  isFirstDay,
  isLastDay,
}: ScheduleRowProps) {
  const daySchedule = schedule[dayKey];
  const dayLabel = DAY_LABELS[dayKey];

  return (
    <div className="grid grid-cols-12 gap-4 items-center py-3">
      {/* Dia da semana */}
      <div className="col-span-2">
        <span className="text-sm font-medium text-gray-900">{dayLabel}</span>
      </div>

      {/* Switch Aberto/Fechado */}
      <div className="col-span-2 flex items-center gap-2">
        <Switch
          checked={daySchedule.active}
          onCheckedChange={(checked) => onToggleActive(dayKey, checked)}
        />
        <span
          className={`text-sm ${daySchedule.active ? "text-green-600 font-medium" : "text-muted-foreground"}`}
        >
          {daySchedule.active ? "Aberto" : "Fechado"}
        </span>
      </div>

      {/* Horário de Abertura */}
      <div className="col-span-2">
        <Label htmlFor={`${dayKey}-open`} className="sr-only">
          Abertura
        </Label>
        <TimeInput
          id={`${dayKey}-open`}
          value={daySchedule.open}
          onChange={(value) => onChangeTime(dayKey, "open", value)}
          disabled={!daySchedule.active}
        />
      </div>

      {/* Horário de Fechamento */}
      <div className="col-span-2">
        <Label htmlFor={`${dayKey}-close`} className="sr-only">
          Fechamento
        </Label>
        <TimeInput
          id={`${dayKey}-close`}
          value={daySchedule.close}
          onChange={(value) => onChangeTime(dayKey, "close", value)}
          disabled={!daySchedule.active}
        />
      </div>

      {/* Botões de Copiar */}
      <div className="col-span-4 flex gap-2">
        {/* Copiar para todos - só aparece no primeiro dia */}
        {isFirstDay && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopyToAll(dayKey)}
            className="h-8 px-3 text-xs rounded-md border border-gray-300 cursor-pointer"
            title="Copiar este horário para todos os dias"
          >
            <CopyCheck className="h-3 w-3 mr-1" />
            Copiar p/todos
          </Button>
        )}

        {/* Copiar para baixo - não aparece no último dia */}
        {!isLastDay && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopyDown(dayKey)}
            className="h-8 px-3 text-xs rounded-md border border-gray-300 cursor-pointer"
            title="Copiar este horário para os dias abaixo"
          >
            <ArrowDown className="h-3 w-3 mr-1" />
            Copiar p/baixo
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ScheduleSettings() {
  const { schedule, isUpdating, updateSchedule } = useSchedule();

  // Estado local para edição
  const [localSchedule, setLocalSchedule] = useState<WeekSchedule | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Feedback visual
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sincroniza estado local com dados da API
  useEffect(() => {
    if (schedule) {
      setLocalSchedule(schedule);
      setHasChanges(false);
    }
  }, [schedule]);

  // Limpa mensagens de sucesso após 3s
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Limpa mensagens de erro após 5s
  useEffect(() => {
    if (saveError) {
      const timer = setTimeout(() => setSaveError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [saveError]);

  // Handler: Alternar ativo/inativo
  const handleToggleActive = (day: DayKey, active: boolean) => {
    if (!localSchedule) return;

    setLocalSchedule({
      ...localSchedule,
      [day]: { ...localSchedule[day], active },
    });
    setHasChanges(true);
  };

  // Handler: Alterar horário
  const handleChangeTime = (day: DayKey, field: "open" | "close", value: string) => {
    if (!localSchedule) return;

    setLocalSchedule({
      ...localSchedule,
      [day]: { ...localSchedule[day], [field]: value },
    });
    setHasChanges(true);
  };

  // Handler: Copiar para todos os dias
  const handleCopyToAll = (sourceDay: DayKey) => {
    if (!localSchedule) return;

    const sourceDaySchedule = localSchedule[sourceDay];
    const newSchedule: WeekSchedule = {} as WeekSchedule;

    // Copia o horário do dia de origem para todos os dias
    for (const day of DAYS_ORDER) {
      newSchedule[day] = { ...sourceDaySchedule };
    }

    setLocalSchedule(newSchedule);
    setHasChanges(true);
  };

  // Handler: Copiar para os dias ABAIXO (na lista)
  const handleCopyDown = (sourceDay: DayKey) => {
    if (!localSchedule) return;

    const sourceDaySchedule = localSchedule[sourceDay];
    const sourceIndex = DAYS_ORDER.indexOf(sourceDay);

    // Pega apenas os dias abaixo do dia atual
    const daysBelow = DAYS_ORDER.slice(sourceIndex + 1);

    if (daysBelow.length === 0) return;

    const newSchedule = { ...localSchedule };

    // Copia o horário do dia de origem para os dias abaixo
    for (const day of daysBelow) {
      newSchedule[day] = { ...sourceDaySchedule };
    }

    setLocalSchedule(newSchedule);
    setHasChanges(true);
  };

  // Handler: Salvar alterações na API
  const handleSave = async () => {
    if (!localSchedule || !hasChanges) return;

    try {
      setSaveError(null);
      await updateSchedule(localSchedule);
      setHasChanges(false);
      setSaveSuccess(true);
    } catch (error: any) {
      console.error("Erro ao salvar horários:", error);
      setSaveError(error.message || "Erro ao salvar horários");
    }
  };

  // Loading state
  if (!localSchedule) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-4 items-center py-2 border-b border-[#E5E2DD]">
          <Skeleton className="h-4 col-span-2" />
          <Skeleton className="h-4 col-span-2" />
          <Skeleton className="h-4 col-span-2" />
          <Skeleton className="h-4 col-span-2" />
          <Skeleton className="h-4 col-span-4" />
        </div>
        {DAYS_ORDER.map((day) => (
          <div key={day} className="grid grid-cols-12 gap-4 items-center py-3">
            <Skeleton className="h-4 col-span-2" />
            <div className="col-span-2 flex items-center gap-2">
              <Skeleton className="h-6 w-10 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-9 col-span-2 rounded-md" />
            <Skeleton className="h-9 col-span-2 rounded-md" />
            <div className="col-span-4 flex gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Feedback de sucesso */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-white border border-green-400 rounded-md text-green-700">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Horários salvos com sucesso!</span>
        </div>
      )}

      {/* Feedback de erro */}
      {saveError && (
        <div className="flex items-center gap-2 p-3 bg-white border border-red-400 rounded-md text-red-700">
          <XCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{saveError}</span>
        </div>
      )}

      {/* Cabeçalho da tabela */}
      <div className="grid grid-cols-12 gap-4 items-center py-2 border-b border-[#E5E2DD]">
        <div className="col-span-2">
          <span className="text-sm font-medium text-muted-foreground">Dia</span>
        </div>
        <div className="col-span-2">
          <span className="text-sm font-medium text-muted-foreground">Status</span>
        </div>
        <div className="col-span-2">
          <span className="text-sm font-medium text-muted-foreground">Abertura</span>
        </div>
        <div className="col-span-2">
          <span className="text-sm font-medium text-muted-foreground">Fechamento</span>
        </div>
        <div className="col-span-4">
          <span className="text-sm font-medium text-muted-foreground">Ações</span>
        </div>
      </div>

      {/* Linhas dos dias */}
      <div className="divide-y divide-[#E5E2DD]">
        {DAYS_ORDER.map((day, index) => (
          <ScheduleRow
            key={day}
            dayKey={day}
            schedule={localSchedule}
            onToggleActive={handleToggleActive}
            onChangeTime={handleChangeTime}
            onCopyToAll={handleCopyToAll}
            onCopyDown={handleCopyDown}
            isFirstDay={index === 0}
            isLastDay={index === DAYS_ORDER.length - 1}
          />
        ))}
      </div>

      {/* Informação de timezone */}
      <div className="text-sm text-muted-foreground pt-2">
        Os horários são configurados no fuso horário de Brasília (GMT-3).
      </div>

      {/* Botão de salvar */}
      <div className="flex items-center gap-4 pt-4 border-t border-[#E5E2DD]">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isUpdating}
          className="rounded-md border border-gray-300 cursor-pointer bg-primary text-white hover:bg-primary/90"
        >
          {isUpdating ? (
            <>
              <AlertCircle className="h-4 w-4 animate-spin mr-1.5" />
              Salvando...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Salvo!
            </>
          ) : (
            "Salvar Horários"
          )}
        </Button>

        {hasChanges && !isUpdating && (
          <span className="text-sm text-amber-600 font-medium">
            Você tem alterações não salvas
          </span>
        )}
      </div>
    </div>
  );
}
