import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  AverageDeliveryTimeEntry,
  AverageDeliveryTimeSummary,
} from "../services/reports-service";

export function useAverageDeliveryTime(startDate: string, endDate: string) {
  const [data, setData] = useState<AverageDeliveryTimeEntry[]>([]);
  const [summary, setSummary] = useState<AverageDeliveryTimeSummary | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getAverageDeliveryTime(
        startDate,
        endDate
      );

      setData(response.data || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de tempo de entrega";
      setError(errorMessage);
      console.error("Erro ao carregar relatório de tempo de entrega:", err);
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
