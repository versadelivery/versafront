"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useSchedule, WeekSchedule } from "../hooks/useSchedule";

interface ScheduleRowProps {
  day: string;
  dayKey: keyof WeekSchedule;
  schedule: WeekSchedule;
  onUpdateDay: (day: keyof WeekSchedule, schedule: any) => void;
  onCopyToAll?: () => void;
  onCopyToWeekdays?: () => void;
  showCopyButtons?: boolean;
}

function ScheduleRow({ 
  day, 
  dayKey, 
  schedule, 
  onUpdateDay, 
  onCopyToAll, 
  onCopyToWeekdays, 
  showCopyButtons = false 
}: ScheduleRowProps) {
  const daySchedule = schedule[dayKey];

  const handleActiveChange = (active: boolean) => {
    onUpdateDay(dayKey, { ...daySchedule, active });
  };

  const handleTimeChange = (field: 'open' | 'close', value: string) => {
    onUpdateDay(dayKey, { ...daySchedule, [field]: value });
  };

  return (
    <div className="grid grid-cols-12 gap-4 items-center py-3">
      {/* Dia da semana */}
      <div className="col-span-2">
        <span className="text-sm font-medium text-gray-700">{day}</span>
      </div>

      {/* Switch Aberto/Fechado */}
      <div className="col-span-2 flex items-center gap-2">
        <Switch
          checked={daySchedule.active}
          onCheckedChange={handleActiveChange}
          className="data-[state=checked]:bg-green-500"
        />
        <span className={`text-sm ${daySchedule.active ? 'text-green-600' : 'text-gray-500'}`}>
          {daySchedule.active ? 'Aberto' : 'Fechado'}
        </span>
      </div>

      {/* Horário de Abertura */}
      <div className="col-span-2">
        <Label htmlFor={`${dayKey}-open`} className="sr-only">Abertura</Label>
        <Input
          id={`${dayKey}-open`}
          type="time"
          value={daySchedule.open}
          onChange={(e) => handleTimeChange('open', e.target.value)}
          disabled={!daySchedule.active}
          className="h-9 text-sm"
        />
      </div>

      {/* Horário de Fechamento */}
      <div className="col-span-2">
        <Label htmlFor={`${dayKey}-close`} className="sr-only">Fechamento</Label>
        <Input
          id={`${dayKey}-close`}
          type="time"
          value={daySchedule.close}
          onChange={(e) => handleTimeChange('close', e.target.value)}
          disabled={!daySchedule.active}
          className="h-9 text-sm"
        />
      </div>

      {/* Botões de Copiar */}
      <div className="col-span-4 flex gap-2">
        {showCopyButtons && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyToAll}
              className="h-8 px-3 text-xs bg-slate-500 text-white border-slate-500 hover:bg-slate-600"
            >
              Copiar p/todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyToWeekdays}
              className="h-8 px-3 text-xs bg-slate-400 text-white border-slate-400 hover:bg-slate-500"
            >
              Copiar p/baixo
            </Button>
          </>
        )}
        {!showCopyButtons && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCopyToWeekdays}
            className="h-8 px-3 text-xs bg-slate-400 text-white border-slate-400 hover:bg-slate-500"
          >
            Copiar p/baixo
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ScheduleSettings() {
  const { schedule, isUpdating, updateSchedule, refetch } = useSchedule();
  const [hasChanges, setHasChanges] = useState(false);
  const [localSchedule, setLocalSchedule] = useState<WeekSchedule | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sincronizar estado local com o schedule da API
  useEffect(() => {
    if (schedule) {
      setLocalSchedule(schedule);
      setHasChanges(false);
    }
  }, [schedule]);

  // Limpar mensagens de feedback após 3 segundos
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  useEffect(() => {
    if (saveError) {
      const timer = setTimeout(() => setSaveError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [saveError]);

  // Atualizar estado local
  const handleUpdateDay = (day: keyof WeekSchedule, daySchedule: any) => {
    if (!localSchedule) return;
    
    const newSchedule = {
      ...localSchedule,
      [day]: daySchedule
    };
    setLocalSchedule(newSchedule);
    setHasChanges(true);
  };

  // Copiar para todos os dias
  const handleCopyToAll = async () => {
    if (!localSchedule) return;
    
    try {
      setSaveError(null);
      const newSchedule = {
        sunday: { ...localSchedule.sunday },
        monday: { ...localSchedule.sunday },
        tuesday: { ...localSchedule.sunday },
        wednesday: { ...localSchedule.sunday },
        thursday: { ...localSchedule.sunday },
        friday: { ...localSchedule.sunday },
        saturday: { ...localSchedule.sunday }
      };
      
      await updateSchedule(newSchedule);
      setHasChanges(false);
      setSaveSuccess(true);
    } catch (error: any) {
      console.error('Erro ao copiar para todos os dias:', error);
      setSaveError(error.message || 'Erro ao copiar horários para todos os dias');
    }
  };

  // Copiar para dias úteis
  const handleCopyToWeekdays = async (daySchedule: any) => {
    if (!localSchedule) return;
    
    try {
      setSaveError(null);
      const newSchedule = {
        ...localSchedule,
        monday: daySchedule,
        tuesday: daySchedule,
        wednesday: daySchedule,
        thursday: daySchedule,
        friday: daySchedule
      };
      
      await updateSchedule(newSchedule);
      setHasChanges(false);
      setSaveSuccess(true);
    } catch (error: any) {
      console.error('Erro ao copiar para dias úteis:', error);
      setSaveError(error.message || 'Erro ao copiar horários para dias úteis');
    }
  };

  // Salvar alterações
  const handleSave = async () => {
    if (!localSchedule || !hasChanges) return;
    
    try {
      setSaveError(null);
      await updateSchedule(localSchedule);
      setHasChanges(false);
      setSaveSuccess(true);
    } catch (error: any) {
      console.error('Erro ao salvar horários:', error);
      setSaveError(error.message || 'Erro ao salvar horários');
    }
  };

  // Copiar horários para turno 3
  const handleCopyToShift3 = () => {
    // Esta funcionalidade pode ser implementada quando necessário
    console.log('Copiar horários para turno 3');
  };

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
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="grid grid-cols-12 gap-4 items-center py-3">
              <Skeleton className="h-4 col-span-2" />
              <div className="col-span-2 flex items-center gap-2">
                <Skeleton className="h-6 w-10 rounded-full" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-9 col-span-2 rounded-md" />
              <Skeleton className="h-9 col-span-2 rounded-md" />
              <div className="col-span-4 flex gap-2">
                <Skeleton className="h-8 w-24 rounded-md" />
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
        {/* Mensagens de Feedback */}
        {saveSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Horários salvos com sucesso!</span>
          </div>
        )}

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
          <ScheduleRow
            day="Domingo"
            dayKey="sunday"
            schedule={localSchedule}
            onUpdateDay={handleUpdateDay}
            onCopyToAll={() => handleCopyToAll()}
            onCopyToWeekdays={() => handleCopyToWeekdays(localSchedule.sunday)}
            showCopyButtons={true}
          />
          
          <ScheduleRow
            day="Segunda-feira"
            dayKey="monday"
            schedule={localSchedule}
            onUpdateDay={handleUpdateDay}
            onCopyToWeekdays={() => handleCopyToWeekdays(localSchedule.monday)}
          />
          
          <ScheduleRow
            day="Terça-feira"
            dayKey="tuesday"
            schedule={localSchedule}
            onUpdateDay={handleUpdateDay}
            onCopyToWeekdays={() => handleCopyToWeekdays(localSchedule.tuesday)}
          />
          
          <ScheduleRow
            day="Quarta-feira"
            dayKey="wednesday"
            schedule={localSchedule}
            onUpdateDay={handleUpdateDay}
            onCopyToWeekdays={() => handleCopyToWeekdays(localSchedule.wednesday)}
          />
          
          <ScheduleRow
            day="Quinta-feira"
            dayKey="thursday"
            schedule={localSchedule}
            onUpdateDay={handleUpdateDay}
            onCopyToWeekdays={() => handleCopyToWeekdays(localSchedule.thursday)}
          />
          
          <ScheduleRow
            day="Sexta-feira"
            dayKey="friday"
            schedule={localSchedule}
            onUpdateDay={handleUpdateDay}
            onCopyToWeekdays={() => handleCopyToWeekdays(localSchedule.friday)}
          />
          
          <ScheduleRow
            day="Sábado"
            dayKey="saturday"
            schedule={localSchedule}
            onUpdateDay={handleUpdateDay}
            onCopyToWeekdays={() => handleCopyToWeekdays(localSchedule.saturday)}
          />
        </div>

        {/* Botões de ação */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!hasChanges || isUpdating}
              className={`${
                saveSuccess 
                  ? "bg-green-600 text-white border-green-600 hover:bg-green-700" 
                  : "bg-slate-700 text-white border-slate-700 hover:bg-slate-800"
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
                "Salvar"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
