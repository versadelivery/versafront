import { useState, useEffect } from "react";
import { scheduleService } from "@/app/admin/settings/general/services/scheduleService";
import { shopStatusService } from "@/services/shopStatusService";

export interface ShopStatus {
  isOpen: boolean;
  todaySchedule: {
    active: boolean;
    open: string;
    close: string;
  } | null;
  nextOpenTime: string | null;
}

export function useShopStatus() {
  const [shopStatus, setShopStatus] = useState<ShopStatus>({
    isOpen: false,
    todaySchedule: null,
    nextOpenTime: null
  });
  const [loading, setLoading] = useState(true);

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

    // Debug para verificar cálculos
    console.log('Debug Shop Status:', {
      brasiliaTime: brasiliaTime.toLocaleString('pt-BR'),
      currentDay,
      currentMinutes,
      openMinutes,
      closeMinutes,
      todaySchedule,
      isOpen
    });

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
      
      // Primeiro tentar buscar o status do backend (mais confiável)
      try {
        const backendStatus = await shopStatusService.getStatus();
        
        // Se conseguir buscar do backend, usar essa informação
        if (backendStatus.data) {
          setShopStatus({
            isOpen: backendStatus.data.attributes.is_open,
            todaySchedule: null, // Pode ser expandido depois
            nextOpenTime: null
          });
          return;
        }
      } catch (backendError) {
        console.warn('Erro ao buscar status do backend, usando cálculo local:', backendError);
      }

      // Fallback: usar cálculo local baseado nos horários
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

  // Atualizar status a cada minuto
  useEffect(() => {
    fetchShopStatus();
    
    const interval = setInterval(() => {
      fetchShopStatus();
    }, 60000); // Atualizar a cada minuto

    return () => clearInterval(interval);
  }, []);

  return {
    shopStatus,
    loading,
    refetch: fetchShopStatus
  };
}
