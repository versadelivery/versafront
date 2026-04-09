import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  ItemModificationEntry,
  ItemModificationsSummary,
} from "../services/reports-service";

export function useItemModifications(startDate: string, endDate: string) {
  const [modifications, setModifications] = useState<ItemModificationEntry[]>(
    []
  );
  const [summary, setSummary] = useState<ItemModificationsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getItemModifications(
        startDate,
        endDate
      );

      setModifications(response.modifications || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de alterações de itens";
      setError(errorMessage);
      console.error("Erro ao carregar relatório de alterações de itens:", err);
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
    modifications,
    summary,
    loading,
    error,
    refetch,
  };
}
