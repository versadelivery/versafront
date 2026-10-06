import api from "@/api/config";
import type { WeekdayState } from "@/components/admin/catalog/weekday-picker";

export type CategoryPayload = { name: string; description?: string; priority?: number; active?: boolean } & Partial<WeekdayState>;

export async function getCatalogCategories() {
  const response = await api.get("/catalog_categories");
  return response.data;
}

export async function createCatalogCategory(data: CategoryPayload) {
  const response = await api.post("/catalog_categories", data);
  return response.data;
}

export async function updateCatalogCategory(id: string, data: Partial<CategoryPayload>) {
  const response = await api.put(`/catalog_categories/${id}`, data);
  return response.data;
}

export async function deleteCatalogCategory(id: string) {
  await api.delete(`/catalog_categories/${id}`);
}
