import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  WeeklySummaryCurrentWeek,
  WeeklySummaryPreviousWeek,
  WeeklySummaryComparison,
} from "../services/reports-service";

export function useWeeklySummary() {
  const [currentWeek, setCurrentWeek] =
    useState<WeeklySummaryCurrentWeek | null>(null);
  const [previousWeek, setPreviousWeek] =
    useState<WeeklySummaryPreviousWeek | null>(null);
  const [comparison, setComparison] =
    useState<WeeklySummaryComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getWeeklySummary();

      setCurrentWeek(response.current_week || null);
      setPreviousWeek(response.previous_week || null);
      setComparison(response.comparison || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar resumo semanal";
      setError(errorMessage);
      console.error("Erro ao carregar resumo semanal:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    currentWeek,
    previousWeek,
    comparison,
    loading,
    error,
    refetch,
  };
}
