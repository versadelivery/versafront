import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  CustomerAcquisitionBreakdownItem,
  CustomerAcquisitionSummary,
} from "../services/reports-service";

export function useCustomerAcquisition(startDate: string, endDate: string) {
  const [breakdown, setBreakdown] = useState<
    CustomerAcquisitionBreakdownItem[]
  >([]);
  const [summary, setSummary] =
    useState<CustomerAcquisitionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getCustomerAcquisition(
        startDate,
        endDate
      );

      setBreakdown(response.breakdown || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de aquisição de clientes";
      setError(errorMessage);
      console.error(
        "Erro ao carregar relatório de aquisição de clientes:",
        err
      );
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
    breakdown,
    summary,
    loading,
    error,
    refetch,
  };
}
