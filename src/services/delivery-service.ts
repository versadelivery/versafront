import api from "@/api/config";

export interface DeliveryNeighborhood {
  id: string;
  name: string;
  amount: number;
  min_value_free_delivery: number | null;
}

export interface DeliveryConfig {
  id: string;
  delivery_fee_kind: "to_be_agreed" | "fixed" | "per_neighborhood" | "per_km";
  amount: number;
  min_value_free_delivery: number | null;
  minimum_order_value: number | null;
  price_per_km: number | null;
  base_fee: number | null;
  max_delivery_distance_km: number | null;
  neighborhoods: DeliveryNeighborhood[];
}

interface ApiDeliveryConfig {
  data: {
    id: string;
    type: string;
    attributes: {
      delivery_fee_kind: "to_be_agreed" | "fixed" | "per_neighborhood" | "per_km";
      amount: number;
      min_value_free_delivery: string | null;
      minimum_order_value: string | null;
      price_per_km: string | null;
      base_fee: string | null;
      max_delivery_distance_km: string | null;
      shop_delivery_neighborhoods: {
        data: Array<{
          id: string;
          type: string;
          attributes: {
            name: string;
            amount: number;
            min_value_free_delivery: string | null;
          };
        }>;
      };
    };
  };
}

export const deliveryService = {
  getDeliveryConfig: async (): Promise<DeliveryConfig> => {
    const response = await api.get<ApiDeliveryConfig>("/shop_delivery_configs");
    const data = response.data.data;
    
    return {
      id: data.id,
      delivery_fee_kind: data.attributes.delivery_fee_kind,
      amount: data.attributes.amount,
      min_value_free_delivery: (data.attributes.min_value_free_delivery !== null && data.attributes.min_value_free_delivery !== undefined) ? parseFloat(data.attributes.min_value_free_delivery.toString()) : null,
      minimum_order_value: (data.attributes.minimum_order_value !== null && data.attributes.minimum_order_value !== undefined) ? parseFloat(data.attributes.minimum_order_value.toString()) : null,
      price_per_km: (data.attributes.price_per_km !== null && data.attributes.price_per_km !== undefined) ? parseFloat(data.attributes.price_per_km.toString()) : null,
      base_fee: (data.attributes.base_fee !== null && data.attributes.base_fee !== undefined) ? parseFloat(data.attributes.base_fee.toString()) : null,
      max_delivery_distance_km: (data.attributes.max_delivery_distance_km !== null && data.attributes.max_delivery_distance_km !== undefined) ? parseFloat(data.attributes.max_delivery_distance_km.toString()) : null,
      neighborhoods: data.attributes.shop_delivery_neighborhoods.data.map(n => ({
        id: n.id,
        name: n.attributes.name,
        amount: n.attributes.amount,
        min_value_free_delivery: (n.attributes.min_value_free_delivery !== null && n.attributes.min_value_free_delivery !== undefined) ? parseFloat(n.attributes.min_value_free_delivery.toString()) : null
      }))
    };
  },

  updateDeliveryConfig: async (data: Omit<DeliveryConfig, "id" | "neighborhoods">) => {
    const response = await api.put<ApiDeliveryConfig>("/shop_delivery_configs", {
      shop_delivery_config: data
    });
    return response.data.data;
  },

  createNeighborhood: async (data: Omit<DeliveryNeighborhood, "id">) => {
    const response = await api.post<{ data: DeliveryNeighborhood }>("/shop_delivery_neighborhoods", {
      shop_delivery_neighborhood: data
    });
    return response.data.data;
  },

  updateNeighborhood: async (id: string, data: Partial<DeliveryNeighborhood>) => {
    const response = await api.put<{ data: DeliveryNeighborhood }>(`/shop_delivery_neighborhoods/${id}`, {
      shop_delivery_neighborhood: data
    });
    return response.data.data;
  },

  deleteNeighborhood: async (id: string) => {
    await api.delete(`/shop_delivery_neighborhoods/${id}`);
  },

  getDeliveryQuote: async (
    shopSlug: string,
    payload: { order_total: number } & ({ address: string; latitude?: never; longitude?: never } | { address?: never; latitude: number; longitude: number })
  ): Promise<{ delivery_fee: number; distance_km: number; deliverable: boolean; latitude: number; longitude: number; resolved_address: string | null }> => {
    const response = await api.post(`/customers/shops/${shopSlug}/delivery_quote`, payload);
    return response.data;
  },

  getAddressSuggestions: async (
    shopSlug: string,
    query: string,
    cityState?: { city: string; state: string }
  ): Promise<{ label: string; latitude: number; longitude: number }[]> => {
    const response = await api.post(`/customers/shops/${shopSlug}/address_suggestions`, { query, ...cityState });
    return response.data.suggestions;
  }
};

export const cepService = {
  lookup: async (cep: string): Promise<{ address: string | null; neighborhood: string | null; city: string | null; state: string | null }> => {
    const digits = cep.replace(/\D/g, "");
    const response = await api.get(`/customers/cep/${digits}`);
    return response.data;
  }
};