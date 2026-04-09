import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  SalesItemEntry,
} from "../services/reports-service";

export function useSalesByItem(startDate: string, endDate: string) {
  const [items, setItems] = useState<SalesItemEntry[]>([]);
  const [groups, setGroups] = useState<SalesItemEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getSalesByItem(startDate, endDate);

      setItems(response.items || []);
      setGroups(response.groups || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de vendas por item";
      setError(errorMessage);
      console.error("Erro ao carregar relatório de vendas por item:", err);
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
    groups,
    loading,
    error,
    refetch,
  };
}
