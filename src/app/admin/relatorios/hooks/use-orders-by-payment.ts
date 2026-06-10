import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  OrdersByPaymentMethodGroup,
  OrdersByPaymentMethodSummary,
} from "../services/reports-service";

export function useOrdersByPayment(date: string) {
  const [data, setData] = useState<OrdersByPaymentMethodGroup[]>([]);
  const [summary, setSummary] = useState<OrdersByPaymentMethodSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!date) return;
    try {
      setLoading(true);
      setError(null);
      const response = await reportsService.getOrdersByPaymentMethod(date);
      setData(response.data || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar pedidos do dia"
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, summary, loading, error, refetch: fetchData };
}
