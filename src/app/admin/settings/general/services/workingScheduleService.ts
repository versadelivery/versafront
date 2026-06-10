import api from "@/api/config";

export interface WorkingScheduleDay {
  id: string;
  type: string;
  attributes: {
    day_of_week: number;
    active: boolean;
    open: string | null;
    close: string | null;
  };
}

export interface WorkingSchedule {
  id: string;
  type: string;
  attributes: {
    name: string;
    active: boolean;
    days: WorkingScheduleDay[];
  };
}

export interface WorkingSchedulesResponse {
  data: WorkingSchedule[];
}

export interface WorkingScheduleResponse {
  data: WorkingSchedule;
}

export interface CreateWorkingScheduleParams {
  name: string;
  active?: boolean;
}

export interface UpdateDayParams {
  id: string;
  day_of_week: number;
  active: boolean;
  open?: string;
  close?: string;
}

export interface UpdateWorkingScheduleParams {
  name?: string;
  active?: boolean;
  days?: UpdateDayParams[];
}

export const workingScheduleService = {
  list: async (): Promise<WorkingSchedulesResponse> => {
    const response = await api.get("/shop_working_schedules");
    return response.data;
  },

  create: async (params: CreateWorkingScheduleParams): Promise<WorkingScheduleResponse> => {
    const response = await api.post("/shop_working_schedules", {
      shop_working_schedule: params,
    });
    return response.data;
  },

  update: async (
    id: string,
    params: UpdateWorkingScheduleParams,
  ): Promise<WorkingScheduleResponse> => {
    const response = await api.put(`/shop_working_schedules/${id}`, {
      shop_working_schedule: params,
    });
    return response.data;
  },

  destroy: async (id: string): Promise<void> => {
    await api.delete(`/shop_working_schedules/${id}`);
  },
};
