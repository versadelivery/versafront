import api from "@/lib/api";

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
    item_type: 'unit' | 'weight_per_g' | 'weight_per_kg';
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

export interface CatalogItemAttributes {
  name: string;
  description: string;
  item_type: string;
  price: number;
  price_with_discount: number;
  measure_interval: number | null;
  min_weight: number | null;
  max_weight: number | null;
  priority: number;
  image_url: string;
  group?: {
    data: any;
  };
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


export interface CatalogItemResponse {
  data: {
    id: string;
    type: 'catalog_item_with_group';
    attributes: CatalogItemAttributes
  }
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

export interface CatalogResponse {
  data: CatalogGroup[];
}

export async function getCatalog(): Promise<CatalogResponse> {
  const response = await api.get('/catalog_groups/');
  return response.data;
}

export async function getCatalogItem(id: string): Promise<CatalogItemResponse> {
  const response = await api.get(`/catalog_items/${id}`);
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

export async function createCatalogItem(formData: FormData) {
  const response = await api.post('/catalog_items/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

export async function updateExtra(id: string, extraId: string, name: string, price: number) {
  const response = await api.put(`/catalog_items/${id}`, {
    "catalog_item_extras_attributes": [
      {
        id: extraId,
        name: name,
        price: price,
      }
    ]
  });
  return response.data;
}

export async function updatePrepareMethod(id: string, prepareMethodId: string, name: string) {
  const response = await api.put(`/catalog_items/${id}`, {
    "catalog_item_prepare_methods_attributes": [
      {
        id: prepareMethodId,
        name: name,
      }
    ]
  });
  return response.data;
}

export async function updateStep(id: string, stepId: string, name: string) {
  const response = await api.put(`/catalog_items/${id}`, {
    "catalog_item_steps_attributes": [
      {
        id: stepId,
        name: name,
      }
    ]
  });
  return response.data;
}

export async function updateStepOption(id: string, stepId: string, optionId: string, name: string) {
  const response = await api.put(`/catalog_items/${id}`, {
    "catalog_item_steps_attributes": [
      {
        id: stepId,
        "catalog_item_step_options_attributes": [
          {
            id: optionId,
            name: name,
          }
        ]
      } 
    ]
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

export async function destroyPrepareMethod(id: string, itemId: string) {
  const response = await api.put(`/catalog_items/${itemId}`, {
    "catalog_item_prepare_methods_attributes": [
      {
        id: id,
        _destroy: true
      }
    ]
  });
  return response.data;
}

export async function destroyExtra(id: string, itemId: string) {
  const response = await api.put(`/catalog_items/${itemId}`, {
    "catalog_item_extras_attributes": [
      {
        id: id, 
        _destroy: true
      }
    ]
  });
  return response.data;
}

export async function destroyStep(id: string, itemId: string) {
  const response = await api.put(`/catalog_items/${id}`, {
    "catalog_item_steps_attributes": [
      {
        id: itemId, 
        _destroy: true
      }
    ]
  });
  return response.data;
}

export async function destroyStepOption(id: string, stepId: string, optionId: string) {
  const response = await api.put(`/catalog_items/${id}`, {
    "catalog_item_steps_attributes": [
      {
        id: stepId, 
        "catalog_item_step_options_attributes": [
          {
          id: optionId, 
          _destroy: true
          }
        ]
      }
    ]
  });
  return response.data;
}
