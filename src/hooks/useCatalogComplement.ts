import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getCatalogComplementGroups,
    createCatalogComplementGroup,
    updateCatalogComplementGroup,
    deleteCatalogComplementGroup
} from "@/api/requests/catalog_complement/requests";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/api-error";

export const useCatalogComplement = () => {
    const queryClient = useQueryClient();

    const { data: complementGroups, isLoading } = useQuery({
        queryKey: ["catalog-complement-groups"],
        queryFn: getCatalogComplementGroups,
    });

    const createComplementGroupMutation = useMutation({
        mutationFn: createCatalogComplementGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["catalog-complement-groups"] });
            toast.success("Lista de adicionais criada com sucesso");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Erro ao criar lista de adicionais"));
        },
    });

    const updateComplementGroupMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateCatalogComplementGroup(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["catalog-complement-groups"] });
            toast.success("Lista de adicionais atualizada com sucesso");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Erro ao atualizar lista de adicionais"));
        },
    });

    const deleteComplementGroupMutation = useMutation({
        mutationFn: deleteCatalogComplementGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["catalog-complement-groups"] });
            queryClient.invalidateQueries({ queryKey: ["catalog"] });
            toast.success("Lista de adicionais deletada com sucesso");
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Erro ao deletar lista de adicionais"));
        },
    });

    return {
        complementGroups: complementGroups?.data || [],
        isLoading,
        createComplementGroup: createComplementGroupMutation.mutate,
        createComplementGroupAsync: createComplementGroupMutation.mutateAsync,
        isCreating: createComplementGroupMutation.isPending,
        updateComplementGroup: updateComplementGroupMutation.mutate,
        updateComplementGroupAsync: updateComplementGroupMutation.mutateAsync,
        isUpdating: updateComplementGroupMutation.isPending,
        deleteComplementGroup: deleteComplementGroupMutation.mutate,
        isDeleting: deleteComplementGroupMutation.isPending,
    };
};
