import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getCatalogComplementGroups,
    createCatalogComplementGroup,
    updateCatalogComplementGroup,
    deleteCatalogComplementGroup
} from "@/api/requests/catalog_complement/requests";
import { toast } from "sonner";

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
        onError: () => {
            toast.error("Erro ao criar lista de adicionais");
        },
    });

    const updateComplementGroupMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateCatalogComplementGroup(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["catalog-complement-groups"] });
            toast.success("Lista de adicionais atualizada com sucesso");
        },
        onError: () => {
            toast.error("Erro ao atualizar lista de adicionais");
        },
    });

    const deleteComplementGroupMutation = useMutation({
        mutationFn: deleteCatalogComplementGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["catalog-complement-groups"] });
            toast.success("Lista de adicionais deletada com sucesso");
        },
        onError: () => {
            toast.error("Erro ao deletar lista de adicionais");
        },
    });

    return {
        complementGroups: complementGroups?.data || [],
        isLoading,
        createComplementGroup: createComplementGroupMutation.mutate,
        isCreating: createComplementGroupMutation.isPending,
        updateComplementGroup: updateComplementGroupMutation.mutate,
        isUpdating: updateComplementGroupMutation.isPending,
        deleteComplementGroup: deleteComplementGroupMutation.mutate,
        isDeleting: deleteComplementGroupMutation.isPending,
    };
};
