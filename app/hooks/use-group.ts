import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroup, updateGroup, deleteGroup, getCatalogGroups } from '../services/group-service';
import { toast } from 'sonner';
import { CatalogGroup, UICatalogGroup } from '../types/catalog';

export const useGroups = () => {
  return useQuery<UICatalogGroup[]>({
    queryKey: ['catalog-groups'],
    queryFn: async () => {
      const response = await getCatalogGroups();
      return response.data.map((group: CatalogGroup) => ({
        id: group.id,
        name: group.attributes.name,
        description: group.attributes.description,
        priority: group.attributes.priority,
        image: group.attributes.image_url,
        products: group.attributes.items
      }));
    },
    initialData: []
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
      toast.success('Grupo criado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao criar grupo');
    }
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
      toast.success('Grupo atualizado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar grupo');
    }
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
      toast.success('Grupo deletado com sucesso');
    },
    onError: () => {
      toast.error('Falha ao deletar grupo');
    }
  });
};