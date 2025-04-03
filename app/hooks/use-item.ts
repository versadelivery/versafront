import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  createCatalogItem, 
  updateCatalogItem, 
  deleteCatalogItem
} from '../services/item-service';

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCatalogItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
      toast.success('Item criado com sucesso');
    },
    onError: (error: any) => {
      console.error('Erro ao criar item:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao criar item';
      toast.error(errorMessage);
    }
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCatalogItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
      toast.success('Item atualizado com sucesso');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar item:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar item';
      toast.error(errorMessage);
    }
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCatalogItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
      toast.success('Item excluído com sucesso');
    },
    onError: (error: any) => {
      console.error('Erro ao excluir item:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao excluir item';
      toast.error(errorMessage);
    }
  });
};