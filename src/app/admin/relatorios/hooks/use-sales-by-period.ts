import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  SalesByPeriodData,
} from "../services/reports-service";

export function useSalesByPeriod(startDate: string, endDate: string) {
  const [data, setData] = useState<SalesByPeriodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getSalesByPeriod(
        startDate,
        endDate
      );

      setData(response.data || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de vendas por período";
      setError(errorMessage);
      console.error("Erro ao carregar relatório de vendas:", err);
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
    loading,
    error,
    refetch,
  };
}
