import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shopService, ShopAttributes } from "../services/shop";
import { toast } from "sonner";

export function useShop() {
  const queryClient = useQueryClient();

  const { data: shop, isLoading } = useQuery({
    queryKey: ["shop"],
    queryFn: shopService.getShop,
  });

  const { mutate: updateShop, isPending: isUpdating } = useMutation({
    mutationFn: (data: Partial<ShopAttributes>) => {
      const payload = { shop: data };
      return shopService.updateShop(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      toast.success("Informações atualizadas com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar informações");
    },
  });

  return {
    shop: shop?.data?.attributes,
    isLoading,
    updateShop,
    isUpdating,
  };
}
