import { useState, useEffect } from "react";
import { scheduleService, ShopScheduleConfig, DaySchedule } from "../services/scheduleService";

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
    
    try {
      const date = new Date(timeString);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      // Se não conseguir fazer parse, assume que já está no formato HH:MM
      return timeString.includes(':') ? timeString : "00:00";
    }
  };

  // Função para converter os dados da API para o formato do componente
  const apiToSchedule = (data: ShopScheduleConfig): WeekSchedule => {
    return {
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
  };

  // Função para converter do formato do componente para a API
  const scheduleToApi = (schedule: WeekSchedule) => {
    return {
      sunday_active: schedule.sunday.active,
      sunday_open: schedule.sunday.open,
      sunday_close: schedule.sunday.close,
      monday_active: schedule.monday.active,
      monday_open: schedule.monday.open,
      monday_close: schedule.monday.close,
      tuesday_active: schedule.tuesday.active,
      tuesday_open: schedule.tuesday.open,
      tuesday_close: schedule.tuesday.close,
      wednesday_active: schedule.wednesday.active,
      wednesday_open: schedule.wednesday.open,
      wednesday_close: schedule.wednesday.close,
      thursday_active: schedule.thursday.active,
      thursday_open: schedule.thursday.open,
      thursday_close: schedule.thursday.close,
      friday_active: schedule.friday.active,
      friday_open: schedule.friday.open,
      friday_close: schedule.friday.close,
      saturday_active: schedule.saturday.active,
      saturday_open: schedule.saturday.open,
      saturday_close: schedule.saturday.close,
    };
  };

  // Buscar horários da API
  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await scheduleService.getSchedule();
      console.log('Raw API response:', response.data);
      const scheduleData = apiToSchedule(response.data);
      console.log('Processed schedule data:', scheduleData);
      setSchedule(scheduleData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar horários');
      console.error('Erro ao buscar horários:', err);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar horários
  const updateSchedule = async (newSchedule: WeekSchedule) => {
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
  };

  // Copiar horário para todos os dias
  const copyToAllDays = (daySchedule: DaySchedule) => {
    if (!schedule) return;
    
    const newSchedule = {
      sunday: { ...daySchedule },
      monday: { ...daySchedule },
      tuesday: { ...daySchedule },
      wednesday: { ...daySchedule },
      thursday: { ...daySchedule },
      friday: { ...daySchedule },
      saturday: { ...daySchedule }
    };
    
    return updateSchedule(newSchedule);
  };

  // Copiar horário para dias úteis
  const copyToWeekdays = (daySchedule: DaySchedule) => {
    if (!schedule) return;
    
    const newSchedule = {
      ...schedule,
      monday: { ...daySchedule },
      tuesday: { ...daySchedule },
      wednesday: { ...daySchedule },
      thursday: { ...daySchedule },
      friday: { ...daySchedule }
    };
    
    return updateSchedule(newSchedule);
  };

  // Atualizar um dia específico
  const updateDay = (day: keyof WeekSchedule, daySchedule: DaySchedule) => {
    if (!schedule) return;
    
    const newSchedule = {
      ...schedule,
      [day]: { ...daySchedule }
    };
    
    setSchedule(newSchedule);
  };

  // Carregar horários na inicialização
  useEffect(() => {
    fetchSchedule();
  }, []);

  return {
    schedule,
    loading,
    error,
    isUpdating,
    updateSchedule,
    updateDay,
    copyToAllDays,
    copyToWeekdays,
    refetch: fetchSchedule
  };
}
