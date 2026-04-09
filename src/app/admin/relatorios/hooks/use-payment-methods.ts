import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  PaymentMethodEntry,
  PaymentMethodsSummary,
} from "../services/reports-service";

export function usePaymentMethods(startDate: string, endDate: string) {
  const [data, setData] = useState<PaymentMethodEntry[]>([]);
  const [summary, setSummary] = useState<PaymentMethodsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getPaymentMethods(
        startDate,
        endDate
      );

      setData(response.data || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de formas de pagamento";
      setError(errorMessage);
      console.error("Erro ao carregar relatório de formas de pagamento:", err);
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
