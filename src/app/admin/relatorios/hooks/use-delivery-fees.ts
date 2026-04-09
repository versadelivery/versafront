import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  DeliveryFeeEntry,
  DeliveryFeesSummary,
} from "../services/reports-service";

export function useDeliveryFees(startDate: string, endDate: string) {
  const [data, setData] = useState<DeliveryFeeEntry[]>([]);
  const [summary, setSummary] = useState<DeliveryFeesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getDeliveryFees(
        startDate,
        endDate
      );

      setData(response.data || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar taxas de entrega";
      setError(errorMessage);
      console.error("Erro ao carregar relatório de taxas de entrega:", err);
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
