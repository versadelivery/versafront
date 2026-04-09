import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  DiscountedOrderEntry,
  DiscountedOrdersSummary,
} from "../services/reports-service";

export function useDiscountedOrders(startDate: string, endDate: string) {
  const [orders, setOrders] = useState<DiscountedOrderEntry[]>([]);
  const [summary, setSummary] = useState<DiscountedOrdersSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getDiscountedOrders(
        startDate,
        endDate
      );

      setOrders(response.orders || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de descontos";
      setError(errorMessage);
      console.error("Erro ao carregar relatório de descontos:", err);
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
    orders,
    summary,
    loading,
    error,
    refetch,
  };
}
