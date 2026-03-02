import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  CashRegisterTransactionEntry,
  CashRegisterStatementSummary,
} from "../services/reports-service";

export function useCashRegisterStatement(startDate: string, endDate: string) {
  const [transactions, setTransactions] = useState<
    CashRegisterTransactionEntry[]
  >([]);
  const [summary, setSummary] =
    useState<CashRegisterStatementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getCashRegisterStatement(
        startDate,
        endDate
      );

      setTransactions(response.transactions || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar extrato de caixa";
      setError(errorMessage);
      console.error("Erro ao carregar extrato de caixa:", err);
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
    transactions,
    summary,
    loading,
    error,
    refetch,
  };
}
