import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCatalogCategory, deleteCatalogCategory, getCatalogCategories, updateCatalogCategory } from "@/services/category-service";
import { toast } from "sonner";

export function useCatalogCategories() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["catalog-categories"], queryFn: getCatalogCategories });
  const create = useMutation({
    mutationFn: createCatalogCategory,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["catalog-categories"] }); toast.success("Categoria criada com sucesso"); },
    onError: () => toast.error("Erro ao criar categoria"),
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateCatalogCategory>[1] }) => updateCatalogCategory(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["catalog-categories"] }); queryClient.invalidateQueries({ queryKey: ["catalog"] }); toast.success("Categoria atualizada"); },
    onError: () => toast.error("Erro ao atualizar categoria"),
  });
  const remove = useMutation({
    mutationFn: deleteCatalogCategory,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["catalog-categories"] }); queryClient.invalidateQueries({ queryKey: ["catalog"] }); toast.success("Categoria removida"); },
    onError: () => toast.error("Erro ao remover categoria"),
  });

  return { categories: query.data?.data ?? [], isLoading: query.isLoading, createCategory: create.mutate, updateCategory: update.mutate, deleteCategory: remove.mutate, isSaving: create.isPending || update.isPending };
}
