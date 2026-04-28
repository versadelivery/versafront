import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryService, DeliveryNeighborhood, DeliveryConfig } from "../services/delivery-service";
import { toast } from "sonner";

export function useDelivery() {
  const queryClient = useQueryClient();

  const { data: deliveryConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["delivery-config"],
    queryFn: async () => {
      const data = await deliveryService.getDeliveryConfig();
      return data;
    },
  });

  const { mutate: updateDeliveryConfig, isPending: isUpdatingConfig } = useMutation({
    mutationFn: async (data: Omit<DeliveryConfig, "id" | "neighborhoods">) => {
      return deliveryService.updateDeliveryConfig(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-config"] });
      toast.success("Configuração de entrega atualizada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar configuração de entrega");
    },
  });

  const { mutate: createNeighborhood, isPending: isCreatingNeighborhood } = useMutation({
    mutationFn: async (data: Omit<DeliveryNeighborhood, "id">) => {
      return deliveryService.createNeighborhood(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-config"] });
      toast.success("Bairro criado com sucesso!");
    },
  });

  const { mutate: updateNeighborhood, isPending: isUpdatingNeighborhood } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DeliveryNeighborhood> }) => {
      return deliveryService.updateNeighborhood(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-config"] });
      toast.success("Bairro atualizado com sucesso!");
    },
  });

  const { mutate: deleteNeighborhood, isPending: isDeletingNeighborhood } = useMutation({
    mutationFn: async (id: string) => {
      return deliveryService.deleteNeighborhood(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-config"] });
      toast.success("Bairro deletado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao deletar bairro");
    },
  });

  return {
    deliveryConfig,
    neighborhoods: deliveryConfig?.neighborhoods || [],
    isLoading: isLoadingConfig,
    updateDeliveryConfig,
    createNeighborhood,
    updateNeighborhood,
    deleteNeighborhood,
    isUpdating: isUpdatingConfig || isCreatingNeighborhood || isUpdatingNeighborhood || isDeletingNeighborhood,
  };
} 