import api from "@/api/config";
import { CatalogItemResponse } from "@/api/requests/catalog_item/types";

export async function getCatalogItem(id: string): Promise<CatalogItemResponse> {
  const response = await api.get(`/catalog_items/${id}`);
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
