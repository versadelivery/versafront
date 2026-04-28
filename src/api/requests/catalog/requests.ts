import api from "@/api/config";
import { CatalogResponse } from "./types"; 

export async function getCatalog(): Promise<CatalogResponse> {
  const response = await api.get('/catalog_groups/');
  return response.data;
}

export async function getCatalogGroup(id: string) {
  const response = await api.get(`/catalog_groups/${id}`);
  return response.data;
}

export async function createCatalogGroup(group: FormData) {
  const response = await api.post('/catalog_groups/', group, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

export async function updateCatalogGroup(group: FormData) {
  const response = await api.put(`/catalog_groups/${group.get('id')}`, group, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

export async function deleteCatalogGroup(id: string) {
  const response = await api.delete(`/catalog_groups/${id}`);
  return response.data;
}

export async function reorderCatalogGroups(orderedIds: string[]) {
  const response = await api.patch('/catalog_groups/reorder', { ordered_ids: orderedIds });
  return response.data;
}