import api from "@/api/config";

export type TemplateItem = { key: string; name: string; unit: "kg" | "un" };
export type TemplateGroup = { key: string; name: string; items: TemplateItem[] };
export type TemplateCategory = { key: string; name: string; groups: TemplateGroup[] };

// { categoria: { grupo: [item, ...] } } com as chaves do template
export type TemplateSelection = Record<string, Record<string, string[]>>;

export async function getCatalogTemplate(): Promise<{ categories: TemplateCategory[] }> {
  const response = await api.get("/catalog_template");
  return response.data;
}

export async function applyCatalogTemplate(selection: TemplateSelection): Promise<{ categories: number; groups: number; items: number }> {
  const response = await api.post("/catalog_template/apply", { selection });
  return response.data;
}

export type PriceRow = { id: string; price: number | null; active: boolean };

export async function bulkUpdateItems(items: PriceRow[]) {
  const response = await api.patch("/catalog_items/bulk_update", { items });
  return response.data;
}
