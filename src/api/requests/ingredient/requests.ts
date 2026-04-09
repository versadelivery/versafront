import api from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

export async function getIngredients() {
  const response = await api.get(`${API_ENDPOINTS.INGREDIENTS}/`);
  return response.data;
}

export async function createIngredient(data: { name: string; in_stock?: boolean }) {
  const response = await api.post(`${API_ENDPOINTS.INGREDIENTS}/`, data);
  return response.data;
}

export async function updateIngredient(id: string, data: { name: string; in_stock?: boolean }) {
  const response = await api.put(`${API_ENDPOINTS.INGREDIENTS}/${id}`, data);
  return response.data;
}

export async function deleteIngredient(id: string) {
  const response = await api.delete(`${API_ENDPOINTS.INGREDIENTS}/${id}`);
  return response.data;
}

export async function toggleIngredientStock(id: string) {
  const response = await api.patch(`${API_ENDPOINTS.INGREDIENTS}/${id}/toggle_stock`);
  return response.data;
}
