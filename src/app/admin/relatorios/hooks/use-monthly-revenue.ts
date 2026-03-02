import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  MonthlyRevenueItem,
  RevenueSummary,
} from "../services/reports-service";

export function useMonthlyRevenue(months?: number) {
  const [data, setData] = useState<MonthlyRevenueItem[]>([]);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getMonthlyRevenue(months);

      setData(response.data || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de relatório";
      setError(errorMessage);
      console.error("Erro ao carregar relatório:", err);
    } finally {
      setLoading(false);
    }
  }, [months]);

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
