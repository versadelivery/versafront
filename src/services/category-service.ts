import api from "@/api/config";
import type { WeekdayState } from "@/components/admin/catalog/weekday-picker";

export type CategoryPayload = { name: string; description?: string; priority?: number; active?: boolean } & Partial<WeekdayState>;

export async function getCatalogCategories() {
  const response = await api.get("/catalog_categories");
  return response.data;
}

export type CategoryImageOptions = { image?: File | null; removeImage?: boolean };

// Com imagem vira multipart (campos planos); sem imagem segue JSON
function toBody(data: Partial<CategoryPayload>, { image, removeImage }: CategoryImageOptions) {
  if (!image && !removeImage) return data;
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => { if (value !== undefined && value !== null) form.append(key, String(value)); });
  if (image) form.append("image", image);
  if (removeImage) form.append("remove_image", "true");
  return form;
}

export async function createCatalogCategory(data: CategoryPayload & CategoryImageOptions) {
  const { image, ...fields } = data;
  const response = await api.post("/catalog_categories", toBody(fields, { image }));
  return response.data;
}

export async function updateCatalogCategory(id: string, data: Partial<CategoryPayload> & CategoryImageOptions) {
  const { image, removeImage, ...fields } = data;
  const response = await api.put(`/catalog_categories/${id}`, toBody(fields, { image, removeImage }));
  return response.data;
}

export async function deleteCatalogCategory(id: string) {
  await api.delete(`/catalog_categories/${id}`);
}

export async function reorderCatalogCategories(orderedIds: string[]) {
  const response = await api.patch("/catalog_categories/reorder", { ordered_ids: orderedIds });
  return response.data;
}
