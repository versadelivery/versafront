import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReferrals,
  getCommissions,
  getCommissionSummary,
  getPayouts,
  getResellerConfig,
  updateResellerConfig,
  ResellerConfig,
} from "../services/reseller-service";
import { toast } from "sonner";

export function useReferrals() {
  return useQuery({
    queryKey: ["reseller-referrals"],
    queryFn: getReferrals,
  });
}

export function useCommissions(params?: { status?: string; year?: number; month?: number }) {
  return useQuery({
    queryKey: ["reseller-commissions", params],
    queryFn: () => getCommissions(params),
  });
}

export function useCommissionSummary() {
  return useQuery({
    queryKey: ["reseller-commission-summary"],
    queryFn: getCommissionSummary,
  });
}

export function usePayouts() {
  return useQuery({
    queryKey: ["reseller-payouts"],
    queryFn: getPayouts,
  });
}

export function useResellerConfig() {
  return useQuery({
    queryKey: ["reseller-config"],
    queryFn: getResellerConfig,
  });
}

export function useUpdateResellerConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ResellerConfig>) => updateResellerConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reseller-config"] });
      toast.success("Dados de recebimento atualizados");
    },
    onError: () => {
      toast.error("Erro ao atualizar dados de recebimento");
    },
  });
}
