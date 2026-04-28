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
    const schedule = {
      sunday: {
        active: data.attributes.sunday_active || false,
        open: extractTime(data.attributes.sunday_open),
        close: extractTime(data.attributes.sunday_close)
      },
      monday: {
        active: data.attributes.monday_active || false,
        open: extractTime(data.attributes.monday_open),
        close: extractTime(data.attributes.monday_close)
      },
      tuesday: {
        active: data.attributes.tuesday_active || false,
        open: extractTime(data.attributes.tuesday_open),
        close: extractTime(data.attributes.tuesday_close)
      },
      wednesday: {
        active: data.attributes.wednesday_active || false,
        open: extractTime(data.attributes.wednesday_open),
        close: extractTime(data.attributes.wednesday_close)
      },
      thursday: {
        active: data.attributes.thursday_active || false,
        open: extractTime(data.attributes.thursday_open),
        close: extractTime(data.attributes.thursday_close)
      },
      friday: {
        active: data.attributes.friday_active || false,
        open: extractTime(data.attributes.friday_open),
        close: extractTime(data.attributes.friday_close)
      },
      saturday: {
        active: data.attributes.saturday_active || false,
        open: extractTime(data.attributes.saturday_open),
        close: extractTime(data.attributes.saturday_close)
      }
    };
    
    return schedule;
  };

  // Função para converter do formato do componente para a API
  const scheduleToApi = (schedule: WeekSchedule) => {
    // Função auxiliar para formatar horário como HH:MM
    const formatTime = (time: string): string => {
      if (!time || !time.includes(':')) return "00:00";
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    return {
      sunday_active: schedule.sunday.active,
      sunday_open: formatTime(schedule.sunday.open),
      sunday_close: formatTime(schedule.sunday.close),
      monday_active: schedule.monday.active,
      monday_open: formatTime(schedule.monday.open),
      monday_close: formatTime(schedule.monday.close),
      tuesday_active: schedule.tuesday.active,
      tuesday_open: formatTime(schedule.tuesday.open),
      tuesday_close: formatTime(schedule.tuesday.close),
      wednesday_active: schedule.wednesday.active,
      wednesday_open: formatTime(schedule.wednesday.open),
      wednesday_close: formatTime(schedule.wednesday.close),
      thursday_active: schedule.thursday.active,
      thursday_open: formatTime(schedule.thursday.open),
      thursday_close: formatTime(schedule.thursday.close),
      friday_active: schedule.friday.active,
      friday_open: formatTime(schedule.friday.open),
      friday_close: formatTime(schedule.friday.close),
      saturday_active: schedule.saturday.active,
      saturday_open: formatTime(schedule.saturday.open),
      saturday_close: formatTime(schedule.saturday.close),
    };
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
