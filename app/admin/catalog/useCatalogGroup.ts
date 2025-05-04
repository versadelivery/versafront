import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCatalog, createCatalogGroup, updateCatalogGroup, deleteCatalogGroup, createCatalogItem } from "./catalog-service";
import { toast } from "sonner";

export const useCatalogGroup = () => {
  const queryClient = useQueryClient();

  const { data: catalog, isLoading, error } = useQuery({
    queryKey: ["catalog-groups"],
    queryFn: getCatalog,
  });

  const getCatalogQuery = useQuery({
    queryKey: ["catalog"],
    queryFn: getCatalog,
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
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
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
    getCatalog: getCatalogQuery.data,
  };
};
