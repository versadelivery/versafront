import api from "../lib/api";
import { API_ENDPOINTS } from "../constants/api";
import { CatalogGroup, CatalogListResponse, Item, Product, SingleCatalogResponse } from "../types/admin";

function mapItemToProduct(item: Item): Product {
  return {
    id: item.id,
    name: item.attributes?.name || '',
    description: item.attributes?.description || '',
    item_type: item.attributes?.item_type,
    unit: item.attributes?.unit_of_measurement,
    price: parseFloat(item.attributes?.price || '0'),
    price_with_discount: parseFloat(item.attributes?.price_with_discount || '0'),
    measure_interval: parseFloat(item.attributes?.measure_interval || '0'),
    min_weight: parseFloat(item.attributes?.min_weight || '0'),
    max_weight: parseFloat(item.attributes?.max_weight || '0'),
    image: item.attributes?.image_url || undefined,
    active: true
  };
}

export async function getCatalogGroups(): Promise<CatalogGroup[]> {
  try {
    const response = await api.get<CatalogListResponse>(API_ENDPOINTS.CATALOG);
    console.log('API Response:', response.data);
    
    if (!response.data || !Array.isArray(response.data.data)) {
      return [];
    }

    return response.data.data.map((group) => {
      const itemsArray = group.attributes?.items || [];
      const products = itemsArray.flatMap(item => {
        if (item.data) {
          return mapItemToProduct(item.data);
        }
        return [];
      });

      return {
        id: Number(group.id) || 0,
        name: group.attributes?.name || '',
        description: group.attributes?.description || '',
        priority: Number(group.attributes?.priority) || 0,
        image: group.attributes?.image_url || undefined,
        products: products
      };
    });
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