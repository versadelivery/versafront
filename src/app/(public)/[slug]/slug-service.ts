import api from "@/api/config";
import { ClientAuthData, ClientData } from "./types";
import { ShopResponse } from "@/types/client-catalog";

export async function fetchShopBySlug(slug: string) {
  const response = await api.get<ShopResponse>(`/customers/shops/${slug}`);
  return response.data;
}

export async function clientRegister(data: ClientData) {
  console.log({
    customer: data,
  });
  const response = await api.post<ClientAuthData>("/customers/register", {
    customer: data,
  });
  return response.data;
}

export async function clientLogin(email: string, password: string) {
  console.log({
    customer: {
      email,
      password,
    },
  });
  const response = await api.post("/customers/login", {
    customer: {
      email,
      password,
    },
  });
  return response.data;
}