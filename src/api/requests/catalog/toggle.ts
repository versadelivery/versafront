import api from "@/api/config";

export async function toggleCatalogItemActive(id: string, active: boolean) {
    const response = await api.put(`/catalog_items/${id}`, { active });
    return response.data;
}

export async function toggleCatalogGroupActive(id: string, active: boolean) {
    const response = await api.put(`/catalog_groups/${id}`, { active });
    return response.data;
}
