import api from "../lib/api";
import { CatalogItem } from "../types/catalog";

export const createCatalogItem = async (formData: FormData) => {
  const response = await api.post<{ data: CatalogItem }>('/catalog_items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const updateCatalogItem = async ({ id, formData }: { id: string; formData: FormData }) => {
  const response = await api.put(`/catalog_items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const deleteCatalogItem = async (id: string) => {
  await api.delete(`/catalog_items/${id}`);
};