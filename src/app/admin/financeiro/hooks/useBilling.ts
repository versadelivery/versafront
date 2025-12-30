import { useState, useEffect, useCallback } from "react";
import {
  billingService,
  MonthlyCharge,
  BillingSummary,
} from "../services/billingService";

export function useBilling() {
  const [charges, setCharges] = useState<MonthlyCharge[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [currentCharge, setCurrentCharge] = useState<MonthlyCharge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [chargesRes, summaryRes, currentRes] = await Promise.all([
        billingService.getCharges(),
        billingService.getSummary(),
        billingService.getCurrentCharge(),
      ]);

      setCharges(chargesRes.data || []);
      setSummary(summaryRes);
      setCurrentCharge(currentRes.data || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar dados de billing";
      setError(errorMessage);
      console.error("Erro ao carregar billing:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refetch = useCallback(() => {
    fetchAll();
  }, [fetchAll]);

  // Cobranças pendentes (pending ou overdue)
  const pendingCharges = charges.filter(
    (c) => c.attributes.status === "pending" || c.attributes.status === "overdue"
  );

  // Cobranças pagas
  const paidCharges = charges.filter((c) => c.attributes.status === "paid");

  return {
    charges,
    summary,
    currentCharge,
    pendingCharges,
    paidCharges,
    loading,
    error,
    refetch,
  };
}
