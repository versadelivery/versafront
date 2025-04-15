import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryService, DeliveryNeighborhood, DeliveryConfig } from "../services/delivery-service";
import { toast } from "sonner";

export function useDelivery() {
  const queryClient = useQueryClient();

  const { data: deliveryConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["delivery-config"],
    queryFn: async () => {
      const data = await deliveryService.getDeliveryConfig();
      console.log("GET Delivery Config:", data);
      return data;
    },
  });

  const { mutate: updateDeliveryConfig, isPending: isUpdatingConfig } = useMutation({
    mutationFn: async (data: Omit<DeliveryConfig, "id" | "neighborhoods">) => {
      console.log("PUT Delivery Config:", data);
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
      console.log("POST Neighborhood:", data);
      return deliveryService.createNeighborhood(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-config"] });
      toast.success("Bairro criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar bairro");
    },
  });

  const { mutate: updateNeighborhood, isPending: isUpdatingNeighborhood } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DeliveryNeighborhood> }) => {
      console.log("PUT Neighborhood:", { id, data });
      return deliveryService.updateNeighborhood(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-config"] });
      toast.success("Bairro atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar bairro");
    },
  });

  const { mutate: deleteNeighborhood, isPending: isDeletingNeighborhood } = useMutation({
    mutationFn: async (id: string) => {
      console.log("DELETE Neighborhood:", id);
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