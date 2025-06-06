import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCatalogGroup, getCatalog, createCatalogGroup, updateCatalogGroup, deleteCatalogGroup } from "@/api/requests/catalog/requests";
import { CatalogItemResponse } from "@/api/requests/catalog_item/types";
import { getCatalogItem, createCatalogItem, destroyExtra, destroyStep, destroyPrepareMethod, deleteCatalogItem, destroyStepOption, updateStep, updateStepOption, updatePrepareMethod, updateExtra } from "@/api/requests/catalog_item/requests";
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
      queryClient.invalidateQueries({ queryKey: ['catalog-item'] });
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
export const useDestroyItems = (id: string, itemId: string, optionId: string) => {
  const queryClient = useQueryClient();
  
  const destroyExtraMutation = useMutation({
    mutationFn: () => destroyExtra(id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-item', id] });
      toast.success("Extra deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar extra");
    },
  });

  const destroyStepItemMutation = useMutation({
    mutationFn: () => destroyStepOption(id, itemId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-item', id] });
      toast.success("Opção deletada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar opção");
    },
  });
  const destroyStepMutation = useMutation({
    mutationFn: () => destroyStep(id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-item', id] });
      toast.success("Etapa deletada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar Etapa");
    },
  });

  const destroyPrepareMethodMutation = useMutation({
    mutationFn: () => destroyPrepareMethod(id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-item', id] });
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
    queryKey: ["catalog-groups"],
    queryFn: getCatalog,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
  
  const { data: catalogGroup, isLoading: isLoadingGroup, error: errorGroup, refetch: refetchGroup } = useQuery({
    queryKey: ["catalog-groups", id],
    queryFn: () => getCatalogGroup(id as any),
    enabled: !!id,
  });

  const createCatalogGroupMutation = useMutation({
    mutationFn: createCatalogGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-groups"] });
      toast.success("Grupo criado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar grupo");
    },
  });

  const updateCatalogGroupMutation = useMutation({
    mutationFn: updateCatalogGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-groups"] });
      toast.success("Grupo atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar grupo");
    },
  });

  const deleteCatalogGroupMutation = useMutation({
    mutationFn: deleteCatalogGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-groups"] });
      toast.success("Grupo deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar grupo");
    },
  });

  const createCatalogItemMutation = useMutation({
    mutationFn: (formData: FormData) => createCatalogItem(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
      toast.success("Item criado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar item");
    },
  });

  return {
    catalog,
    isLoading,
    error,
    createCatalogGroup: createCatalogGroupMutation.mutate,
    updateCatalogGroup: updateCatalogGroupMutation.mutate,
    deleteCatalogGroup: deleteCatalogGroupMutation.mutate,
    isCreatingGroup: createCatalogGroupMutation.isPending,
    isUpdatingGroup: updateCatalogGroupMutation.isPending,
    isDeletingGroup: deleteCatalogGroupMutation.isPending,
    createCatalogItem: createCatalogItemMutation.mutate,
    isCreatingItem: createCatalogItemMutation.isPending,
    getCatalog: catalog,
    isLoadingCatalog: isLoading,
    refetchCatalog: refetch,
    catalogGroup,
    isLoadingGroup,
    errorGroup,
    refetchGroup,
  };
};
