import { useState, useEffect, useCallback } from "react";
import {
  workingScheduleService,
  WorkingSchedule,
  UpdateDayParams,
} from "../services/workingScheduleService";

export const DAY_LABELS: Record<number, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

export function useWorkingSchedules() {
  const [schedules, setSchedules] = useState<WorkingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await workingScheduleService.list();
      setSchedules(response.data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar horários");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const createSchedule = useCallback(async (name: string) => {
    const response = await workingScheduleService.create({ name, active: false });
    setSchedules((prev) => [...prev, response.data]);
    return response.data;
  }, []);

  const toggleActive = useCallback(async (id: string, active: boolean) => {
    const response = await workingScheduleService.update(id, { active });
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id === id) return response.data;
        if (active) return { ...s, attributes: { ...s.attributes, active: false } };
        return s;
      })
    );
  }, []);

  const renameSchedule = useCallback(async (id: string, name: string) => {
    const response = await workingScheduleService.update(id, { name });
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? response.data : s))
    );
  }, []);

  const updateDays = useCallback(async (id: string, days: UpdateDayParams[]) => {
    const response = await workingScheduleService.update(id, { days });
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? response.data : s))
    );
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    await workingScheduleService.destroy(id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    toggleActive,
    renameSchedule,
    updateDays,
    deleteSchedule,
  };
}
