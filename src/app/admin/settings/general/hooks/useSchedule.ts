import { useState, useEffect, useMemo, useCallback } from "react";
import { scheduleService, ShopScheduleConfig, DaySchedule } from "../services/scheduleService";

// Tipo para as chaves dos dias da semana
export type DayKey = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";

export interface WeekSchedule {
  sunday: DaySchedule;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
}

export function useSchedule() {
  const [schedule, setSchedule] = useState<WeekSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Função para extrair apenas a hora de um timestamp
  const extractTime = (timeString: string | null): string => {
    if (!timeString) return "00:00";

    // Se já está no formato HH:MM, retorna diretamente
    const directMatch = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (directMatch) {
      return `${directMatch[1].padStart(2, '0')}:${directMatch[2]}`;
    }

    // ISO format: extrai a parte de tempo diretamente da string (sem usar new Date que aplica timezone)
    const isoMatch = timeString.match(/T(\d{2}):(\d{2})/);
    if (isoMatch) {
      return `${isoMatch[1]}:${isoMatch[2]}`;
    }

    // Fallback: tenta extrair qualquer padrão HH:MM
    const anyMatch = timeString.match(/(\d{1,2}):(\d{2})/);
    if (anyMatch) {
      return `${anyMatch[1].padStart(2, '0')}:${anyMatch[2]}`;
    }

    return "00:00";
  };

  // Função para converter os dados da API para o formato do componente
  const apiToSchedule = (data: ShopScheduleConfig): WeekSchedule => {
    const attrs = data.attributes as Record<string, boolean | string | null>;
    const buildDay = (day: DayKey): DaySchedule => ({
      active: Boolean(attrs[`${day}_active`]),
      open: extractTime(attrs[`${day}_open`] as string | null),
      close: extractTime(attrs[`${day}_close`] as string | null),
      secondOpen: attrs[`${day}_second_open`] ? extractTime(attrs[`${day}_second_open`] as string) : null,
      secondClose: attrs[`${day}_second_close`] ? extractTime(attrs[`${day}_second_close`] as string) : null,
    });

    return {
      sunday: buildDay("sunday"), monday: buildDay("monday"),
      tuesday: buildDay("tuesday"), wednesday: buildDay("wednesday"),
      thursday: buildDay("thursday"), friday: buildDay("friday"),
      saturday: buildDay("saturday"),
    };
  };

  // Função para converter do formato do componente para a API
  const scheduleToApi = (schedule: WeekSchedule) => {
    // Função auxiliar para formatar horário como HH:MM
    const formatTime = (time: string): string => {
      if (!time || !time.includes(':')) return "00:00";
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    return (Object.keys(schedule) as DayKey[]).reduce<Record<string, boolean | string | null>>((result, day) => {
      const value = schedule[day];
      result[`${day}_active`] = value.active;
      result[`${day}_open`] = formatTime(value.open);
      result[`${day}_close`] = formatTime(value.close);
      result[`${day}_second_open`] = value.secondOpen ? formatTime(value.secondOpen) : null;
      result[`${day}_second_close`] = value.secondClose ? formatTime(value.secondClose) : null;
      return result;
    }, {});
  };

  // Buscar horários da API
  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await scheduleService.getSchedule();
      const scheduleData = apiToSchedule(response.data);
      setSchedule(scheduleData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar horários');
      console.error('Erro ao buscar horários:', err);
    } finally {
      setLoading(false);
    }
  };

  // Memoizar o resultado da conversão para manter a referência estável
  const scheduleData = useMemo(() => {
    if (!schedule) return null;
    return schedule;
  }, [schedule]);

  // Envolver funções em useCallback para manter referências estáveis
  const stabilizedUpdateSchedule = useCallback(async (newSchedule: WeekSchedule) => {
    try {
      setIsUpdating(true);
      setError(null);
      const apiData = scheduleToApi(newSchedule);
      const response = await scheduleService.updateSchedule({
        shop_schedule_config: apiData
      });
      const updatedSchedule = apiToSchedule(response.data);
      setSchedule(updatedSchedule);
      return updatedSchedule;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar horários';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const stabilizedRefetch = useCallback(() => {
    return fetchSchedule();
  }, []);

  // Carregar horários na inicialização
  useEffect(() => {
    fetchSchedule();
  }, []);

  return {
    schedule: scheduleData,
    loading,
    error,
    isUpdating,
    updateSchedule: stabilizedUpdateSchedule,
    refetch: stabilizedRefetch,
  };
}
