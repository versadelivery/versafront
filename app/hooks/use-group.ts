import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroup, updateGroup, deleteGroup, getCatalogGroups } from '../services/group-service';
import { toast } from 'sonner';
import { CatalogGroup, UICatalogGroup } from '../types/catalog';

export const useGroups = () => {
  return useQuery<UICatalogGroup[]>({
    queryKey: ['catalog-groups'],
    queryFn: async () => {
      const response = await getCatalogGroups();
      console.log("Raw catalog groups response:", response);
      
      const mappedGroups = response.data.map((group: CatalogGroup) => {
        console.log("Group before mapping:", group);
        
        if (!group || !group.attributes) {
          console.error("Grupo inválido na resposta:", group);
          return {
            id: "invalid-group",
            name: "Grupo inválido",
            description: "Este grupo não pôde ser carregado",
            priority: 0,
            products: []
          };
        }
        
        const products = group.attributes.items || [];
        console.log("Products in group:", products);
        
        return {
          id: group.id,
          name: group.attributes.name,
          description: group.attributes.description,
          priority: group.attributes.priority,
          image: group.attributes.image_url,
          products: products
        };
      });
      
      console.log("Mapped groups:", mappedGroups);
      return mappedGroups;
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