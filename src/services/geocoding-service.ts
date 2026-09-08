import api from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

export interface GeoPlace {
  label: string;
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  latitude: number;
  longitude: number;
}

export interface DeliveryQuote {
  distance_km: number;
  duration_minutes: number | null;
  amount: number;
  tier: {
    min_km: number;
    max_km: number | null;
    amount: number;
  };
}

export interface DeliveryQuoteError {
  message: string;
  distance_km: number | null;
}

export interface DeliveryRoute {
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  distance_km: number;
  duration_minutes: number | null;
  /** Traçado da rota como pares [latitude, longitude]. */
  geometry: number[][];
}

export async function getOrderDeliveryRoute(orderId: string | number): Promise<DeliveryRoute> {
  const response = await api.get<{ data: DeliveryRoute }>(`/orders/${orderId}/delivery_route`);
  return response.data.data;
}

export async function searchAddresses(shopId: string | number, query: string): Promise<GeoPlace[]> {
  const response = await api.get<{ data: GeoPlace[] }>(API_ENDPOINTS.GEOCODING_AUTOCOMPLETE, {
    params: { shop_id: shopId, q: query },
  });
  return response.data.data ?? [];
}

export async function reverseGeocode(
  shopId: string | number,
  latitude: number,
  longitude: number
): Promise<GeoPlace | null> {
  const response = await api.get<{ data: GeoPlace | null }>(API_ENDPOINTS.GEOCODING_REVERSE, {
    params: { shop_id: shopId, latitude, longitude },
  });
  return response.data.data ?? null;
}

export async function getDeliveryQuote(input: {
  shopId: string | number;
  latitude: number;
  longitude: number;
  itemsTotal?: number;
}): Promise<DeliveryQuote> {
  const response = await api.post<{ data: DeliveryQuote }>(API_ENDPOINTS.DELIVERY_QUOTES, {
    shop_id: input.shopId,
    latitude: input.latitude,
    longitude: input.longitude,
    items_total: input.itemsTotal,
  });
  return response.data.data;
}

export function parseDeliveryQuoteError(error: unknown): DeliveryQuoteError {
  const response = (error as { response?: { data?: { error?: string; distance_km?: number } } })?.response;
  return {
    message: response?.data?.error || "Não foi possível calcular a taxa de entrega. Tente novamente.",
    distance_km: response?.data?.distance_km ?? null,
  };
}

export function formatDistance(distanceKm: number): string {
  return `${distanceKm.toFixed(1).replace(".", ",")} km`;
}
