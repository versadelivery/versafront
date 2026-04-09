import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  SalesByChannelEntry,
  SalesByChannelSummary,
} from "../services/reports-service";

export function useSalesByChannel(startDate: string, endDate: string) {
  const [data, setData] = useState<SalesByChannelEntry[]>([]);
  const [summary, setSummary] = useState<SalesByChannelSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getSalesByChannel(
        startDate,
        endDate
      );

      setData(response.data || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de vendas por canal";
      setError(errorMessage);
      console.error("Erro ao carregar relatório de vendas por canal:", err);
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
