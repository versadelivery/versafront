import api from "@/app/lib/api";

interface CatalogItemStepOption {
  id: string;
  type: 'catalog_item_step_option';
  attributes: {
    name: string;
  };
}

interface CatalogItemStep {
  id: string;
  type: 'catalog_item_step';
  attributes: {
    name: string;
    options: {
      data: CatalogItemStepOption[];
    };
  };
}

interface CatalogItemPrepareMethod {
  id: string;
  type: 'catalog_item_prepare_method';
  attributes: {
    name: string;
  };
}

interface CatalogItemExtra {
  id: string;
  type: 'catalog_item_extra';
  attributes: {
    name: string;
    price: string;
  };
}

export interface Item{
  name: string;
    description: string;
    item_type: 'unit' | 'weight';
    unit_of_measurement: string | null;
    price: number;
    price_with_discount: number | null;
    measure_interval: number | null;
    min_weight: number | null;
    max_weight: number | null;
    priority: number;
    image_url: string | null;
    extra: {
      data: CatalogItemExtra[];
    };
    prepare_method: {
      data: CatalogItemPrepareMethod[];
    };
    steps: {
      data: CatalogItemStep[];
    };
}

interface CatalogItem {
  id: string;
  type: 'catalog_item';
  attributes: Item
}

interface CatalogGroup {
  id: string;
  type: 'catalog_group';
  attributes: {
    name: string;
    description: string;
    priority: number;
    image_url: string | null;
    items: {
      data: CatalogItem;
    }[];
  };
}

interface CatalogResponse {
  data: CatalogGroup[];
}

export async function getCatalog(): Promise<CatalogResponse> {
  const response = await api.get('/catalog_groups/');
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

export async function createCatalogItem(formData: FormData) {
  const response = await api.post('/catalog_items/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

export async function updateCatalogItem(item: FormData) {
  const response = await api.put(`/catalog_items/${item.get('id')}`, item, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

export async function deleteCatalogItem(id: string) {
  const response = await api.delete(`/catalog_items/${id}`);
  return response.data;
}


