import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  TopCustomerEntry,
  TopCustomersSummary,
} from "../services/reports-service";

export function useTopCustomers(startDate: string, endDate: string) {
  const [customers, setCustomers] = useState<TopCustomerEntry[]>([]);
  const [summary, setSummary] = useState<TopCustomersSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getTopCustomers(
        startDate,
        endDate
      );

      setCustomers(response.customers || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de top clientes";
      setError(errorMessage);
      console.error("Erro ao carregar relatório de top clientes:", err);
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
    customers,
    summary,
    loading,
    error,
    refetch,
  };
}
