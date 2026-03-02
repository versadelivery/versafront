import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  AverageTicketBreakdownItem,
  AverageTicketSummary,
} from "../services/reports-service";

export function useAverageTicket(
  startDate: string,
  endDate: string,
  granularity?: string
) {
  const [breakdown, setBreakdown] = useState<AverageTicketBreakdownItem[]>([]);
  const [summary, setSummary] = useState<AverageTicketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getAverageTicket(
        startDate,
        endDate,
        granularity
      );

      setBreakdown(response.breakdown || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de ticket médio";
      setError(errorMessage);
      console.error("Erro ao carregar relatório de ticket médio:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, granularity]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    breakdown,
    summary,
    loading,
    error,
    refetch,
  };
}
