import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shopService, ShopAttributes } from "../services/shop";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export function useShop() {
  const queryClient = useQueryClient();

  const { data: shop, isLoading } = useQuery({
    queryKey: ["shop"],
    queryFn: shopService.getShop,
  });

  const shopData = useMemo(() => {
    if (!shop?.data) return null;
    return {
      ...shop.data.attributes,
      id: shop.data.id
    };
  }, [shop?.data?.id, shop?.data?.attributes]);

  const { mutate: updateShop, isPending: isUpdating } = useMutation({
    mutationFn: (data: Partial<ShopAttributes>) => {
      const payload = { shop: data };
      return shopService.updateShop(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      toast.success("Informações atualizadas com sucesso!");
    },
    onError: (error: AxiosError<{ error?: string }>) => {
      toast.error(error.response?.data?.error || "Erro ao atualizar informações");
    },
  });

  return {
    shop: shopData,
    isLoading,
    updateShop,
    isUpdating,
  };
}
