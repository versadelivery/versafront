"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, AlertCircle, CopyCheck, ArrowDown } from "lucide-react";
import { useSchedule, WeekSchedule, DayKey } from "../hooks/useSchedule";

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
        <span className="text-sm font-medium text-gray-700">{dayLabel}</span>
      </div>

      {/* Switch Aberto/Fechado */}
      <div className="col-span-2 flex items-center gap-2">
        <Switch
          checked={daySchedule.active}
          onCheckedChange={(checked) => onToggleActive(dayKey, checked)}
          className="data-[state=checked]:bg-green-500"
        />
        <span
          className={`text-sm ${daySchedule.active ? "text-green-600" : "text-gray-500"}`}
        >
          {daySchedule.active ? "Aberto" : "Fechado"}
        </span>
      </div>

      {/* Horário de Abertura */}
      <div className="col-span-2">
        <Label htmlFor={`${dayKey}-open`} className="sr-only">
          Abertura
        </Label>
        <Input
          id={`${dayKey}-open`}
          type="time"
          value={daySchedule.open}
          onChange={(e) => onChangeTime(dayKey, "open", e.target.value)}
          disabled={!daySchedule.active}
          className="h-9 text-sm"
        />
      </div>

      {/* Horário de Fechamento */}
      <div className="col-span-2">
        <Label htmlFor={`${dayKey}-close`} className="sr-only">
          Fechamento
        </Label>
        <Input
          id={`${dayKey}-close`}
          type="time"
          value={daySchedule.close}
          onChange={(e) => onChangeTime(dayKey, "close", e.target.value)}
          disabled={!daySchedule.active}
          className="h-9 text-sm"
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
            className="h-8 px-3 text-xs bg-slate-500 text-white border-slate-500 hover:bg-slate-600"
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
            className="h-8 px-3 text-xs bg-slate-400 text-white border-slate-400 hover:bg-slate-500"
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
      <Card className="p-6 shadow-none border rounded-lg">
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 items-center py-2 border-b border-gray-200">
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
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-none border rounded-lg">
      <div className="space-y-4">
        {/* Feedback de sucesso */}
        {saveSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Horários salvos com sucesso!</span>
          </div>
        )}

        {/* Feedback de erro */}
        {saveError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{saveError}</span>
          </div>
        )}

        {/* Cabeçalho da tabela */}
        <div className="grid grid-cols-12 gap-4 items-center py-2 border-b border-gray-200">
          <div className="col-span-2">
            <span className="text-sm font-medium text-gray-600">Dia</span>
          </div>
          <div className="col-span-2">
            <span className="text-sm font-medium text-gray-600">Status</span>
          </div>
          <div className="col-span-2">
            <span className="text-sm font-medium text-gray-600">Abertura</span>
          </div>
          <div className="col-span-2">
            <span className="text-sm font-medium text-gray-600">Fechamento</span>
          </div>
          <div className="col-span-4">
            <span className="text-sm font-medium text-gray-600">Ações</span>
          </div>
        </div>

        {/* Linhas dos dias */}
        <div className="space-y-1">
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
        <div className="text-xs text-gray-500 pt-2">
          Os horários são configurados no fuso horário de Brasília (GMT-3).
        </div>

        {/* Botão de salvar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!hasChanges || isUpdating}
              className={`${
                saveSuccess
                  ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                  : hasChanges
                    ? "bg-slate-700 text-white border-slate-700 hover:bg-slate-800"
                    : "bg-gray-100 text-gray-400 border-gray-200"
              } flex items-center gap-2`}
            >
              {isUpdating ? (
                <>
                  <AlertCircle className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Salvo!
                </>
              ) : (
                "Salvar Horários"
              )}
            </Button>

            {hasChanges && !isUpdating && (
              <span className="text-xs text-amber-600">
                Você tem alterações não salvas
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
