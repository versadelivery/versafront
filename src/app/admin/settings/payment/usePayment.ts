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
      // a API explica o motivo (ex.: chave PIX obrigatória, CPF/CNPJ inválido)
      const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(message || "Erro ao atualizar métodos de pagamento");
    },
  });

  return { paymentMethodsData, isLoading, updatePaymentMethodsMutation, isUpdating: updatePaymentMethodsMutation.isPending };
};
