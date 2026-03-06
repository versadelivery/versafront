import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderCatalogGroups } from "@/api/requests/catalog/requests";
import { reorderCatalogItems } from "@/api/requests/catalog_item/requests";
import { toast } from "sonner";

export const useCatalogReorder = () => {
  const queryClient = useQueryClient();

  const reorderGroupsMutation = useMutation({
    mutationFn: (orderedIds: string[]) => reorderCatalogGroups(orderedIds),
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: ["catalog"] });
      const previousCatalog = queryClient.getQueryData(["catalog"]);

      queryClient.setQueryData(["catalog"], (old: any) => {
        if (!old) return old;
        const sorted = orderedIds
          .map((id) => old.data.find((g: any) => g.id === id))
          .filter(Boolean);
        const reordered = sorted.map((group: any, index: number) => ({
          ...group,
          attributes: {
            ...group.attributes,
            priority: sorted.length - index,
          },
        }));
        return { ...old, data: reordered };
      });

      return { previousCatalog };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCatalog) {
        queryClient.setQueryData(["catalog"], context.previousCatalog);
      }
      toast.error("Erro ao reordenar grupos");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });

  const reorderItemsMutation = useMutation({
    mutationFn: ({ groupId, orderedIds }: { groupId: string; orderedIds: string[] }) =>
      reorderCatalogItems(groupId, orderedIds),
    onMutate: async ({ groupId, orderedIds }) => {
      await queryClient.cancelQueries({ queryKey: ["catalog"] });
      const previousCatalog = queryClient.getQueryData(["catalog"]);

      queryClient.setQueryData(["catalog"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((group: any) => {
            if (group.id !== groupId) return group;

            const items = group.attributes.items || [];
            const reordered = orderedIds
              .map((id) => {
                return items.find((item: any) => {
                  const itemId = item.id || item.data?.id;
                  return itemId?.toString() === id;
                });
              })
              .filter(Boolean);

            return {
              ...group,
              attributes: { ...group.attributes, items: reordered },
            };
          }),
        };
      });

      return { previousCatalog };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCatalog) {
        queryClient.setQueryData(["catalog"], context.previousCatalog);
      }
      toast.error("Erro ao reordenar itens");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });

  return {
    reorderGroups: reorderGroupsMutation.mutate,
    isReorderingGroups: reorderGroupsMutation.isPending,
    reorderItems: reorderItemsMutation.mutate,
    isReorderingItems: reorderItemsMutation.isPending,
  };
};
