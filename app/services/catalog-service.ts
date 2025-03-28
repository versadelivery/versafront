import api from "../lib/api";
import { API_ENDPOINTS } from "../constants/api";
import { CatalogGroup, CatalogListResponse, SingleCatalogResponse } from "../types/admin";

export async function getCatalogGroups(): Promise<CatalogGroup[]> {
  try {
    const response = await api.get<CatalogListResponse>(API_ENDPOINTS.CATALOG);
    
    if (!response.data || !Array.isArray(response.data.data)) {
      console.error('Estrutura de resposta inesperada:', response.data);
      return [];
    }

    return response.data.data.map((item) => ({
      id: Number(item.id) || 0,
      name: item.attributes?.name || '',
      description: item.attributes?.description || '',
      priority: Number(item.attributes?.priority) || 0,
      image: item.attributes?.image_url || undefined,
      products: []
    }));
  } catch (error) {
    console.error('Erro no getCatalogGroups:', error);
    return [];
  }
}

export async function createCatalogGroup(formData: FormData): Promise<CatalogGroup> {
  try {
    const response = await api.post<SingleCatalogResponse>(API_ENDPOINTS.CATALOG, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    const responseData = response.data.data;
    return {
      id: Number(responseData.id) || 0,
      name: responseData.attributes?.name || '',
      description: responseData.attributes?.description || '',
      priority: Number(responseData.attributes?.priority) || 0,
      image: responseData.attributes?.image_url || undefined,
      products: []
    };
  } catch (error) {
    console.error('Erro no createCatalogGroup:', error);
    throw error;
  }
}

export async function updateCatalogGroup(id: number, formData: FormData): Promise<CatalogGroup> {
  try {
    const response = await api.put<SingleCatalogResponse>(`${API_ENDPOINTS.CATALOG}${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    const responseData = response.data.data;
    return {
      id: Number(responseData.id) || 0,
      name: responseData.attributes?.name || '',
      description: responseData.attributes?.description || '',
      priority: Number(responseData.attributes?.priority) || 0,
      image: responseData.attributes?.image_url || undefined,
      products: []
    };  
  } catch (error) {
    console.error('Erro ao atualizar catálogo:', error);
    throw error;
  }
}

export async function deleteCatalogGroup(id: number): Promise<void> {
  try {
    await api.delete(`${API_ENDPOINTS.CATALOG}${id}`);
  } catch (error) {
    console.error('Erro ao deletar o catálogo:', error);
    throw error;
  }
}