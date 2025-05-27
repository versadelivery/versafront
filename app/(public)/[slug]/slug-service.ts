import api from "@/app/lib/api";
import { ClientAuthData, ClientData, ShopData } from "./types";

export async function fetchShopBySlug(slug: string) {
  const response = await api.get<ShopData>(`/customers/shops/${slug}`);
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
  const response = await api.post("/customers/login", {
    customer: {
      email,
      password,
    },
  });
  return response.data;
}