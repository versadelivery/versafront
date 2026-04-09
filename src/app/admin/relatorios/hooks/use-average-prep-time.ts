import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  AveragePrepTimeEntry,
  AveragePrepTimeSummary,
} from "../services/reports-service";

export function useAveragePrepTime(startDate: string, endDate: string) {
  const [data, setData] = useState<AveragePrepTimeEntry[]>([]);
  const [summary, setSummary] = useState<AveragePrepTimeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getAveragePrepTime(
        startDate,
        endDate
      );

      setData(response.data || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de tempo de preparo";
      setError(errorMessage);
      console.error("Erro ao carregar relatório de tempo de preparo:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    summary,
    loading,
    error,
    refetch,
  };
}
