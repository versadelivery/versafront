import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCatalogCategory, deleteCatalogCategory, getCatalogCategories, reorderCatalogCategories, updateCatalogCategory } from "@/services/category-service";
import { toast } from "sonner";

export function useCatalogCategories() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["catalog-categories"], queryFn: getCatalogCategories });
  const create = useMutation({
    mutationFn: createCatalogCategory,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["catalog-categories"] }); toast.success("Categoria criada com sucesso"); },
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateCatalogCategory>[1] }) => updateCatalogCategory(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["catalog-categories"] }); queryClient.invalidateQueries({ queryKey: ["catalog"] }); toast.success("Categoria atualizada"); },
  });
  const remove = useMutation({
    mutationFn: deleteCatalogCategory,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["catalog-categories"] }); queryClient.invalidateQueries({ queryKey: ["catalog"] }); toast.success("Categoria removida"); },
    onError: () => toast.error("Erro ao remover categoria"),
  });

  const reorder = useMutation({
    mutationFn: reorderCatalogCategories,
    onMutate: async (orderedIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: ["catalog-categories"] });
      const previous = queryClient.getQueryData(["catalog-categories"]);
      queryClient.setQueryData(["catalog-categories"], (old: any) => old && {
        ...old,
        data: orderedIds.map((id) => old.data.find((c: any) => c.id === id)).filter(Boolean),
      });
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(["catalog-categories"], context.previous);
      toast.error("Erro ao reordenar categorias");
    },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ["catalog-categories"] }); },
  });

  return { reorderCategories: reorder.mutate, categories: query.data?.data ?? [], isLoading: query.isLoading, createCategory: create.mutate, updateCategory: update.mutate, deleteCategory: remove.mutate, isSaving: create.isPending || update.isPending };
}
