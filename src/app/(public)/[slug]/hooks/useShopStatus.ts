import { useState, useEffect } from "react";
import { scheduleService } from "@/app/admin/settings/general/services/scheduleService";

export interface ShopStatus {
  isOpen: boolean;
  todaySchedule: {
    active: boolean;
    open: string;
    close: string;
  } | null;
  nextOpenTime: string | null;
}

interface UseShopStatusOptions {
  initialShopStatus?: {
    is_open: boolean;
    current_time?: string;
    timezone?: string;
  };
  shopScheduleConfig?: any;
}

export function useShopStatus(options?: UseShopStatusOptions) {
  const [shopStatus, setShopStatus] = useState<ShopStatus>({
    isOpen: options?.initialShopStatus?.is_open ?? false,
    todaySchedule: null,
    nextOpenTime: null
  });
  const [loading, setLoading] = useState(!options?.initialShopStatus);

  // Função para obter o dia da semana em inglês
  const getCurrentDayKey = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const now = new Date();
    return days[now.getDay()];
  };

  // Função para converter string de horário para minutos desde meia-noite
  const timeStringToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Função para calcular se a loja está aberta
  const calculateShopStatus = (schedule: any): ShopStatus => {
    if (!schedule) {
      return { isOpen: false, todaySchedule: null, nextOpenTime: null };
    }

    // Usar horário de Brasília com verificação mais robusta
    const now = new Date();
    
    // Força o uso do timezone do Brasil
    const brasiliaTime = new Date(now.toLocaleString("en-US", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }));
    
    // Obter dia da semana baseado no horário de Brasília
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[brasiliaTime.getDay()];
    
    // Pegar horário de hoje
    const todaySchedule = schedule[currentDay as keyof typeof schedule];
    
    if (!todaySchedule || !todaySchedule.active) {
      return { 
        isOpen: false, 
        todaySchedule: todaySchedule || null, 
        nextOpenTime: null 
      };
    }

    // Converter horários para minutos desde meia-noite
    const currentMinutes = brasiliaTime.getHours() * 60 + brasiliaTime.getMinutes();
    const openMinutes = timeStringToMinutes(todaySchedule.open);
    const closeMinutes = timeStringToMinutes(todaySchedule.close);

    let isOpen = false;

    // Se close é menor que open, significa que fecha no dia seguinte (ex: 22:00 às 06:00)
    if (closeMinutes < openMinutes) {
      isOpen = currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
    } else {
      // Horário normal (ex: 08:00 às 18:00)
      isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    }


    return {
      isOpen,
      todaySchedule,
      nextOpenTime: isOpen ? null : todaySchedule.open
    };
  };

  // Buscar horários e calcular status
  const fetchShopStatus = async () => {
    try {
      setLoading(true);
      
      // Se temos schedule config do servidor, usar cálculo local
      if (options?.shopScheduleConfig) {
        const config = options.shopScheduleConfig;
        const schedule = {
          sunday: {
            active: config.sunday_active ?? false,
            open: config.sunday_open ? 
              (typeof config.sunday_open === 'string' && config.sunday_open.includes('T') 
                ? config.sunday_open.substring(11, 16) 
                : config.sunday_open) : "00:00",
            close: config.sunday_close ? 
              (typeof config.sunday_close === 'string' && config.sunday_close.includes('T')
                ? config.sunday_close.substring(11, 16)
                : config.sunday_close) : "23:59"
          },
          monday: {
            active: config.monday_active ?? false,
            open: config.monday_open ? 
              (typeof config.monday_open === 'string' && config.monday_open.includes('T')
                ? config.monday_open.substring(11, 16)
                : config.monday_open) : "00:00",
            close: config.monday_close ? 
              (typeof config.monday_close === 'string' && config.monday_close.includes('T')
                ? config.monday_close.substring(11, 16)
                : config.monday_close) : "23:59"
          },
          tuesday: {
            active: config.tuesday_active ?? false,
            open: config.tuesday_open ? 
              (typeof config.tuesday_open === 'string' && config.tuesday_open.includes('T')
                ? config.tuesday_open.substring(11, 16)
                : config.tuesday_open) : "00:00",
            close: config.tuesday_close ? 
              (typeof config.tuesday_close === 'string' && config.tuesday_close.includes('T')
                ? config.tuesday_close.substring(11, 16)
                : config.tuesday_close) : "23:59"
          },
          wednesday: {
            active: config.wednesday_active ?? false,
            open: config.wednesday_open ? 
              (typeof config.wednesday_open === 'string' && config.wednesday_open.includes('T')
                ? config.wednesday_open.substring(11, 16)
                : config.wednesday_open) : "00:00",
            close: config.wednesday_close ? 
              (typeof config.wednesday_close === 'string' && config.wednesday_close.includes('T')
                ? config.wednesday_close.substring(11, 16)
                : config.wednesday_close) : "23:59"
          },
          thursday: {
            active: config.thursday_active ?? false,
            open: config.thursday_open ? 
              (typeof config.thursday_open === 'string' && config.thursday_open.includes('T')
                ? config.thursday_open.substring(11, 16)
                : config.thursday_open) : "00:00",
            close: config.thursday_close ? 
              (typeof config.thursday_close === 'string' && config.thursday_close.includes('T')
                ? config.thursday_close.substring(11, 16)
                : config.thursday_close) : "23:59"
          },
          friday: {
            active: config.friday_active ?? false,
            open: config.friday_open ? 
              (typeof config.friday_open === 'string' && config.friday_open.includes('T')
                ? config.friday_open.substring(11, 16)
                : config.friday_open) : "00:00",
            close: config.friday_close ? 
              (typeof config.friday_close === 'string' && config.friday_close.includes('T')
                ? config.friday_close.substring(11, 16)
                : config.friday_close) : "23:59"
          },
          saturday: {
            active: config.saturday_active ?? false,
            open: config.saturday_open ? 
              (typeof config.saturday_open === 'string' && config.saturday_open.includes('T')
                ? config.saturday_open.substring(11, 16)
                : config.saturday_open) : "00:00",
            close: config.saturday_close ? 
              (typeof config.saturday_close === 'string' && config.saturday_close.includes('T')
                ? config.saturday_close.substring(11, 16)
                : config.saturday_close) : "23:59"
          }
        };

        const status = calculateShopStatus(schedule);
        setShopStatus(status);
        setLoading(false);
        return;
      }

      // Fallback: tentar buscar do backend (requer autenticação - apenas para admin)
      const response = await scheduleService.getSchedule();
      
      if (response.data) {
        // Converter dados da API para formato do hook
        const schedule = {
          sunday: {
            active: response.data.attributes.sunday_active,
            open: response.data.attributes.sunday_open ? 
              response.data.attributes.sunday_open.substring(11, 16) : "00:00",
            close: response.data.attributes.sunday_close ? 
              response.data.attributes.sunday_close.substring(11, 16) : "23:59"
          },
          monday: {
            active: response.data.attributes.monday_active,
            open: response.data.attributes.monday_open ? 
              response.data.attributes.monday_open.substring(11, 16) : "00:00",
            close: response.data.attributes.monday_close ? 
              response.data.attributes.monday_close.substring(11, 16) : "23:59"
          },
          tuesday: {
            active: response.data.attributes.tuesday_active,
            open: response.data.attributes.tuesday_open ? 
              response.data.attributes.tuesday_open.substring(11, 16) : "00:00",
            close: response.data.attributes.tuesday_close ? 
              response.data.attributes.tuesday_close.substring(11, 16) : "23:59"
          },
          wednesday: {
            active: response.data.attributes.wednesday_active,
            open: response.data.attributes.wednesday_open ? 
              response.data.attributes.wednesday_open.substring(11, 16) : "00:00",
            close: response.data.attributes.wednesday_close ? 
              response.data.attributes.wednesday_close.substring(11, 16) : "23:59"
          },
          thursday: {
            active: response.data.attributes.thursday_active,
            open: response.data.attributes.thursday_open ? 
              response.data.attributes.thursday_open.substring(11, 16) : "00:00",
            close: response.data.attributes.thursday_close ? 
              response.data.attributes.thursday_close.substring(11, 16) : "23:59"
          },
          friday: {
            active: response.data.attributes.friday_active,
            open: response.data.attributes.friday_open ? 
              response.data.attributes.friday_open.substring(11, 16) : "00:00",
            close: response.data.attributes.friday_close ? 
              response.data.attributes.friday_close.substring(11, 16) : "23:59"
          },
          saturday: {
            active: response.data.attributes.saturday_active,
            open: response.data.attributes.saturday_open ? 
              response.data.attributes.saturday_open.substring(11, 16) : "00:00",
            close: response.data.attributes.saturday_close ? 
              response.data.attributes.saturday_close.substring(11, 16) : "23:59"
          }
        };

        const status = calculateShopStatus(schedule);
        setShopStatus(status);
      }
    } catch (error) {
      console.error('Erro ao buscar status da loja:', error);
      setShopStatus({ isOpen: false, todaySchedule: null, nextOpenTime: null });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status a cada minuto (apenas se não tivermos dados iniciais)
  useEffect(() => {
    if (!options?.initialShopStatus && !options?.shopScheduleConfig) {
      fetchShopStatus();

      const interval = setInterval(() => {
        fetchShopStatus();
      }, 60000); // Atualizar a cada minuto

      return () => clearInterval(interval);
    } else {
      fetchShopStatus();
    }
  }, []);

  // Reagir a mudanças do is_open vindo da API (React Query → contexto → prop)
  // Garante que fechar/abrir a loja no admin reflita sem recarregar a página
  useEffect(() => {
    if (options?.initialShopStatus?.is_open !== undefined) {
      setShopStatus(prev => ({ ...prev, isOpen: options.initialShopStatus!.is_open }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.initialShopStatus?.is_open]);

  return {
    shopStatus,
    loading,
    refetch: fetchShopStatus
  };
}
