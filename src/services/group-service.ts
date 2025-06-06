import api from "@/lib/api";
import { GroupData } from "../types/catalog";

export const getCatalogGroups = async () => {
  try {
    const response = await api.get('/catalog_groups', {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching catalog groups:", error);
    return { data: [] };
  }
}

export const createGroup = async (formData: GroupData) => {
  const response = await api.post('/catalog_groups', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateGroup = async ({ id, formData }: { id: string; formData: FormData }) => {
  const response = await api.put(`/catalog_groups/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteGroup = async (id: string) => {
  await api.delete(`/catalog_groups/${id}`);
};