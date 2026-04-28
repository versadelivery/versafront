import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  toggleIngredientStock,
} from "@/api/requests/ingredient/requests";
import { toast } from "sonner";

export const useIngredient = () => {
  const queryClient = useQueryClient();

  const { data: ingredients, isLoading } = useQuery({
    queryKey: ["ingredients"],
    queryFn: getIngredients,
  });

  const createIngredientMutation = useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      toast.success("Ingrediente criado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar ingrediente");
    },
  });

  const updateIngredientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; in_stock?: boolean } }) =>
      updateIngredient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      toast.success("Ingrediente atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar ingrediente");
    },
  });

  const deleteIngredientMutation = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      toast.success("Ingrediente deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar ingrediente");
    },
  });

  const toggleStockMutation = useMutation({
    mutationFn: toggleIngredientStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
    onError: () => {
      toast.error("Erro ao alterar estoque do ingrediente");
    },
  });

  return {
    ingredients: ingredients?.data || [],
    isLoading,
    createIngredient: createIngredientMutation.mutate,
    isCreating: createIngredientMutation.isPending,
    updateIngredient: updateIngredientMutation.mutate,
    isUpdating: updateIngredientMutation.isPending,
    deleteIngredient: deleteIngredientMutation.mutate,
    isDeleting: deleteIngredientMutation.isPending,
    toggleStock: toggleStockMutation.mutate,
    isTogglingStock: toggleStockMutation.isPending,
  };
};
