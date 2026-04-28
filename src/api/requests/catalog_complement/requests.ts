import api from "@/api/config";

export async function getCatalogComplementGroups() {
    const response = await api.get('/catalog_complement_groups/');
    return response.data;
}

export async function getCatalogComplementGroup(id: string) {
    const response = await api.get(`/catalog_complement_groups/${id}`);
    return response.data;
}

export async function createCatalogComplementGroup(data: any) {
    const response = await api.post('/catalog_complement_groups/', data);
    return response.data;
}

export async function updateCatalogComplementGroup(id: string, data: any) {
    const response = await api.put(`/catalog_complement_groups/${id}`, data);
    return response.data;
}

export async function deleteCatalogComplementGroup(id: string) {
    const response = await api.delete(`/catalog_complement_groups/${id}`);
    return response.data;
}
