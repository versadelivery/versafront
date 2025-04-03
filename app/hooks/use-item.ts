import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { createCatalogItem, updateCatalogItem, deleteCatalogItem } from "../services/item-service";

export function useCreateItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCatalogItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
    }
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      return await updateCatalogItem({ id, formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
    }
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCatalogItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
    }
  });
}