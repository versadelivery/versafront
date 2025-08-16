import api from "@/api/config";
import { prepareScheduleForAPI } from "@/utils/time";

export interface DaySchedule {
  active: boolean;
  open: string;
  close: string;
}

export interface ShopScheduleConfig {
  id: string;
  type: string;
  attributes: {
    sunday_active: boolean | null;
    sunday_open: string | null;
    sunday_close: string | null;
    monday_active: boolean | null;
    monday_open: string | null;
    monday_close: string | null;
    tuesday_active: boolean | null;
    tuesday_open: string | null;
    tuesday_close: string | null;
    wednesday_active: boolean | null;
    wednesday_open: string | null;
    wednesday_close: string | null;
    thursday_active: boolean | null;
    thursday_open: string | null;
    thursday_close: string | null;
    friday_active: boolean | null;
    friday_open: string | null;
    friday_close: string | null;
    saturday_active: boolean | null;
    saturday_open: string | null;
    saturday_close: string | null;
  };
}

export interface ScheduleResponse {
  data: ShopScheduleConfig;
}

export interface UpdateScheduleRequest {
  shop_schedule_config: Partial<ShopScheduleConfig['attributes']>;
}

export const scheduleService = {
  // Obter configuração de horário
  getSchedule: async (): Promise<ScheduleResponse> => {
    const response = await api.get('/shop_schedule_configs');
    return response.data;
  },

  // Atualizar configuração de horário
  updateSchedule: async (data: UpdateScheduleRequest): Promise<ScheduleResponse> => {
    // Normaliza os horários antes de enviar para a API
    const normalizedData = {
      shop_schedule_config: prepareScheduleForAPI(data.shop_schedule_config)
    };
    
    const response = await api.put('/shop_schedule_configs', normalizedData);
    return response.data;
  }
};
