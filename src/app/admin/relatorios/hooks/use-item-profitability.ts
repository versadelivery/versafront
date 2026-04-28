import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  ItemProfitabilityEntry,
  ItemProfitabilitySummary,
} from "../services/reports-service";

export function useItemProfitability(startDate: string, endDate: string) {
  const [items, setItems] = useState<ItemProfitabilityEntry[]>([]);
  const [summary, setSummary] = useState<ItemProfitabilitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getItemProfitability(
        startDate,
        endDate
      );

      setItems(response.items || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de lucratividade";
      setError(errorMessage);
      console.error("Erro ao carregar relatório de lucratividade:", err);
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
    items,
    summary,
    loading,
    error,
    refetch,
  };
}
