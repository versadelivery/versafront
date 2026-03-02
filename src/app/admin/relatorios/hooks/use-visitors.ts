import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  VisitorBreakdownItem,
  VisitorsSummary,
} from "../services/reports-service";

export function useVisitors(startDate: string, endDate: string) {
  const [breakdown, setBreakdown] = useState<VisitorBreakdownItem[]>([]);
  const [summary, setSummary] = useState<VisitorsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getVisitors(startDate, endDate);

      setBreakdown(response.breakdown || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de visitantes";
      setError(errorMessage);
      console.error("Erro ao carregar relatório de visitantes:", err);
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
    breakdown,
    summary,
    loading,
    error,
    refetch,
  };
}
