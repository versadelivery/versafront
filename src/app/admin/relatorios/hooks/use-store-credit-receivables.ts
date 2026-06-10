import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  StoreCreditReceivableCustomer,
  StoreCreditReceivablesSummary,
} from "../services/reports-service";

export function useStoreCreditReceivables(startDate: string, endDate: string) {
  const [customers, setCustomers] = useState<StoreCreditReceivableCustomer[]>([]);
  const [summary, setSummary] = useState<StoreCreditReceivablesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);
      const response = await reportsService.getStoreCreditReceivables(startDate, endDate);
      setCustomers(response.customers || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar crediário";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { customers, summary, loading, error, refetch: fetchData };
}
