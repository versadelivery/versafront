import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCatalogGroup, getCatalog, createCatalogGroup, updateCatalogGroup, deleteCatalogGroup } from "@/api/requests/catalog/requests";
import { toggleCatalogGroupActive, toggleCatalogItemActive } from "@/api/requests/catalog/toggle";
import { CatalogItemResponse } from "@/api/requests/catalog_item/types";
import { getCatalogItem, createCatalogItem, duplicateCatalogItem, destroyExtra, destroyStep, destroyPrepareMethod, deleteCatalogItem, destroyStepOption, updateStep, updateStepOption, updatePrepareMethod, updateExtra, updateCatalogItem } from "@/api/requests/catalog_item/requests";
import { toast } from "sonner";

interface EditStepProps {
  id: string;
  stepId: string;
  name: string;
  optionId?: string;
  price?: number;
}

export const useEditStep = ({ id, stepId, name, optionId, price }: EditStepProps) => {
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useQuery({
    queryKey: ["catalog-item", id],
    queryFn: () => getCatalogItem(id),
  });

  const updateExtraMutation = useMutation({
    mutationFn: () => updateExtra(id, stepId, name, price || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-item', id] });
      toast.success("Extra atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar extra");
    },
  });

  const updatePrepareMethodMutation = useMutation({
    mutationFn: () => updatePrepareMethod(id, stepId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      toast.success("Método de preparo atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar método de preparo");
    },
  });

  const updateStepMutation = useMutation({
    mutationFn: () => updateStep(id, stepId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-item', id] });
      toast.success("Etapa atualizada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar etapa");
    },
  });

  const updateStepOptionMutation = useMutation({
    mutationFn: () => updateStepOption(id, stepId, optionId as string, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-item', id] });
      toast.success("Opção atualizada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar opção");
    },
  });

  return {
    item,
    isLoading,
    updateStep: updateStepMutation.mutate,
    isUpdatingStep: updateStepMutation.isPending,
    updateStepOption: updateStepOptionMutation.mutate,
    isUpdatingStepOption: updateStepOptionMutation.isPending,
    updatePrepareMethod: updatePrepareMethodMutation.mutate,
    isUpdatingPrepareMethod: updatePrepareMethodMutation.isPending,
    updateExtra: updateExtraMutation.mutate,
    isUpdatingExtra: updateExtraMutation.isPending,
  };
}
export const useDestroyItems = () => {
  const queryClient = useQueryClient();

  const destroyExtraMutation = useMutation({
    mutationFn: ({ extraId, itemId }: { extraId: string, itemId: string }) => destroyExtra(extraId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-item', variables.itemId] });
      toast.success("Extra deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar extra");
    },
  });

  const destroyStepItemMutation = useMutation({
    mutationFn: ({ itemId, stepId, optionId }: { itemId: string, stepId: string, optionId: string }) =>
      destroyStepOption(itemId, stepId, optionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-item', variables.itemId] });
      toast.success("Opção deletada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar opção");
    },
  });

  const destroyStepMutation = useMutation({
    mutationFn: ({ itemId, stepId }: { itemId: string, stepId: string }) => destroyStep(itemId, stepId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-item', variables.itemId] });
      toast.success("Etapa deletada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar Etapa");
    },
  });

  const destroyPrepareMethodMutation = useMutation({
    mutationFn: ({ methodId, itemId }: { methodId: string, itemId: string }) => destroyPrepareMethod(methodId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-item', variables.itemId] });
      toast.success("Método de preparo deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar método de preparo");
    },
  });

  return {
    destroyExtra: destroyExtraMutation.mutate,
    destroyStep: destroyStepMutation.mutate,
    destroyPrepareMethod: destroyPrepareMethodMutation.mutate,
    isDestroyingExtra: destroyExtraMutation.isPending,
    isDestroyingStep: destroyStepMutation.isPending,
    isDestroyingPrepareMethod: destroyPrepareMethodMutation.isPending,
    destroyStepItem: destroyStepItemMutation.mutate,
    isDestroyingStepItem: destroyStepItemMutation.isPending,
  };
}

export const useCatalogItem = (id: string) => {
  const queryClient = useQueryClient();

  const catalogItemQuery = useQuery<CatalogItemResponse>({
    queryKey: ["catalog-item", id],
    queryFn: () => getCatalogItem(id),
    enabled: !!id,
  });

  const deleteCatalogItemMutation = useMutation({
    mutationFn: () => deleteCatalogItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-item', id] });
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      toast.success("Item deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar item");
    },
  });
  return {
    catalogItem: catalogItemQuery.data,
    isLoadingCatalogItem: catalogItemQuery.isLoading,
    deleteCatalogItem: deleteCatalogItemMutation.mutate,
    isDeletingCatalogItem: deleteCatalogItemMutation.isPending,
  };
};

export const useCatalogGroup = (id?: string) => {
  const queryClient = useQueryClient();

  const { data: catalog, isLoading, error, refetch } = useQuery({
    queryKey: ["catalog"],
    queryFn: getCatalog,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  const { data: catalogGroup, isLoading: isLoadingGroup, error: errorGroup, refetch: refetchGroup } = useQuery({
    queryKey: ["catalog-group", id],
    queryFn: () => getCatalogGroup(id as any),
    enabled: !!id,
  });

  const createCatalogGroupMutation = useMutation({
    mutationFn: createCatalogGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast.success("Grupo criado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar grupo");
    },
  });

  const updateCatalogGroupMutation = useMutation({
    mutationFn: updateCatalogGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast.success("Grupo atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar grupo");
    },
  });

  const deleteCatalogGroupMutation = useMutation({
    mutationFn: deleteCatalogGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast.success("Grupo deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar grupo");
    },
  });

  const createCatalogItemMutation = useMutation({
    mutationFn: (formData: FormData) => createCatalogItem(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      toast.success("Item criado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar item");
    },
  });

  const duplicateCatalogItemMutation = useMutation({
    mutationFn: (id: string) => duplicateCatalogItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      toast.success("Item duplicado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao duplicar item");
    },
  });

  const toggleCatalogGroupActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      toggleCatalogGroupActive(id, active),
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: ["catalog"] });
      const previousCatalog = queryClient.getQueryData(["catalog"]);
      queryClient.setQueryData(["catalog"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((group: any) =>
            group.id === id
              ? { ...group, attributes: { ...group.attributes, active } }
              : group
          )
        };
      });
      return { previousCatalog };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast.success("Status do grupo atualizado");
    },
    onError: (err, variables, context) => {
      if (context?.previousCatalog) {
        queryClient.setQueryData(["catalog"], context.previousCatalog);
      }
      toast.error("Erro ao atualizar status do grupo");
    },
  });

  const toggleCatalogItemActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      toggleCatalogItemActive(id, active),
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: ["catalog"] });
      const previousCatalog = queryClient.getQueryData(["catalog"]);
      queryClient.setQueryData(["catalog"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((group: any) => ({
            ...group,
            attributes: {
              ...group.attributes,
              items: group.attributes.items?.map((item: any) => {
                // Handle both raw item and JSONAPI nested item
                const itemId = item.id || item.data?.id;
                if (itemId?.toString() === id.toString()) {
                  if (item.attributes) {
                    return { ...item, attributes: { ...item.attributes, active } };
                  }
                  return { ...item, active };
                }
                return item;
              })
            }
          }))
        };
      });
      return { previousCatalog };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast.success("Status do item atualizado");
    },
    onError: (err, variables, context) => {
      if (context?.previousCatalog) {
        queryClient.setQueryData(["catalog"], context.previousCatalog);
      }
      toast.error("Erro ao atualizar status do item");
    },
  });

  return {
    catalog,
    isLoading,
    error,
    createCatalogGroup: createCatalogGroupMutation.mutate,
    updateCatalogGroup: updateCatalogGroupMutation.mutate,
    deleteCatalogGroup: deleteCatalogGroupMutation.mutate,
    toggleCatalogGroupActive: toggleCatalogGroupActiveMutation.mutate,
    toggleCatalogItemActive: toggleCatalogItemActiveMutation.mutate,
    isCreatingGroup: createCatalogGroupMutation.isPending,
    isUpdatingGroup: updateCatalogGroupMutation.isPending,
    isDeletingGroup: deleteCatalogGroupMutation.isPending,
    createCatalogItem: createCatalogItemMutation.mutate,
    isCreatingItem: createCatalogItemMutation.isPending,
    duplicateCatalogItem: duplicateCatalogItemMutation.mutate,
    isDuplicatingItem: duplicateCatalogItemMutation.isPending,
    getCatalog: catalog,
    isLoadingCatalog: isLoading,
    refetchCatalog: refetch,
    catalogGroup,
    isLoadingGroup,
    errorGroup,
    refetchGroup,
  };
};
