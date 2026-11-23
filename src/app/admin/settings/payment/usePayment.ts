import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPaymentMethods, updatePaymentMethods, ShopPaymentConfig } from "./payment-service";
import { toast } from "sonner";

export const usePayment = () => {
  const queryClient = useQueryClient();

  const { data: paymentMethodsData, isLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => getPaymentMethods(),
  });

  const updatePaymentMethodsMutation = useMutation({
    mutationFn: (paymentMethods: ShopPaymentConfig) => updatePaymentMethods(paymentMethods),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast.success("Métodos de pagamento atualizados com sucesso");
    },
    onError: (error: unknown) => {
      const response = (error as { response?: { status?: number; data?: { error?: string } } })?.response;
      if (response?.status === 403) {
        toast.error("Você não tem permissão para alterar as formas de pagamento. Peça ao administrador da loja.");
        return;
      }
      toast.error(response?.data?.error || "Erro ao atualizar métodos de pagamento");
    },
  });

  return { paymentMethodsData, isLoading, updatePaymentMethodsMutation, isUpdating: updatePaymentMethodsMutation.isPending };
};
