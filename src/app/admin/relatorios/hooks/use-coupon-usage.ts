import { useState, useEffect, useCallback } from "react";
import {
  reportsService,
  CouponUsageEntry,
  CouponUsageSummary,
} from "../services/reports-service";

export function useCouponUsage(startDate: string, endDate: string) {
  const [coupons, setCoupons] = useState<CouponUsageEntry[]>([]);
  const [summary, setSummary] = useState<CouponUsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reportsService.getCouponUsage(
        startDate,
        endDate
      );

      setCoupons(response.coupons || []);
      setSummary(response.summary || null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados de cupons";
      setError(errorMessage);
      console.error("Erro ao carregar relatório de cupons:", err);
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
    coupons,
    summary,
    loading,
    error,
    refetch,
  };
}
