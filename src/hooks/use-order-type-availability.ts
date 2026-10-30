import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deliveryService, OrderTypeAvailabilityInput } from "@/services/delivery-service";
import { Availability, OrderType, getAvailability } from "@/lib/order-type-availability";
import { getApiErrorMessage } from "@/utils/api-error";

// Chave própria (e não "delivery-config"): atualizar a tela de configurações de entrega
// durante a digitação apagaria os campos ainda não salvos.
const QUERY_KEY = ["order-type-availability"];
const FIELD: Record<OrderType, keyof OrderTypeAvailabilityInput> = {
  delivery: "accepts_delivery",
  pickup: "accepts_pickup",
};
const LABEL: Record<OrderType, string> = { delivery: "Entrega", pickup: "Retirada" };

export function useOrderTypeAvailability() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => getAvailability(await deliveryService.getDeliveryConfig()),
  });

  const mutation = useMutation({
    mutationFn: ({ type, on }: { type: OrderType; on: boolean }) =>
      deliveryService.updateOrderTypeAvailability({ [FIELD[type]]: on }),
    onMutate: async ({ type, on }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<Availability>(QUERY_KEY);
      if (previous) queryClient.setQueryData<Availability>(QUERY_KEY, { ...previous, [type]: on });
      return { previous };
    },
    onSuccess: (_saved, { type, on }) => {
      toast.success(`${LABEL[type]} ${on ? "ligada" : "desligada"}`);
    },
    onError: (error, { type }, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEY, context.previous);
      toast.error(getApiErrorMessage(error, `Não foi possível alterar ${LABEL[type].toLowerCase()}`));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    availability: data,
    isLoading,
    isSaving: mutation.isPending,
    setAvailable: (type: OrderType, on: boolean) => mutation.mutate({ type, on }),
  };
}
