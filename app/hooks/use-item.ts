import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { createCatalogItem, updateCatalogItem, deleteCatalogItem } from "../services/item-service";

interface ExtraAttribute {
  name: string;
  price: string;
}

interface PrepareMethodAttribute {
  name: string;
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const newFormData = new FormData();
      for (const [key, value] of formData.entries()) {
        newFormData.append(key, value);
      }
      
      const formDataObj = Object.fromEntries(newFormData.entries());
      
      const result = await createCatalogItem(newFormData);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Erro ao criar item";
        throw new Error(errorMessage);
      }
      throw error;
    }
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const processedFormData = new FormData();
      
      for (const [key, value] of formData.entries()) {
        processedFormData.append(key, value);
      }
      
      console.log('FormData processado:', Object.fromEntries(processedFormData.entries()));
      return await updateCatalogItem({ id, formData: processedFormData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Erro ao atualizar item";
        throw new Error(errorMessage);
      }
      throw error;
    }
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCatalogItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Erro ao deletar item";
        throw new Error(errorMessage);
      }
      throw error;
    }
  });
}