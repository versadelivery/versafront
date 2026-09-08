import api from "@/api/config";

export type DeliveryFeeKind = "to_be_agreed" | "fixed" | "per_neighborhood" | "per_km";

export interface DeliveryNeighborhood {
  id: string;
  name: string;
  amount: number;
  min_value_free_delivery: number | null;
}

export interface DeliveryDistanceTier {
  id?: string;
  min_km: number;
  max_km: number | null;
  amount: number;
}

export interface DeliveryConfig {
  id: string;
  delivery_fee_kind: DeliveryFeeKind;
  amount: number;
  min_value_free_delivery: number | null;
  minimum_order_value: number | null;
  latitude: number | null;
  longitude: number | null;
  location_address: string | null;
  max_delivery_distance_km: number | null;
  neighborhoods: DeliveryNeighborhood[];
  distanceTiers: DeliveryDistanceTier[];
}

export type DeliveryConfigInput = Omit<
  DeliveryConfig,
  "id" | "neighborhoods" | "distanceTiers"
> & {
  distance_tiers?: DeliveryDistanceTier[];
};

interface ApiDeliveryConfig {
  data: {
    id: string;
    type: string;
    attributes: {
      delivery_fee_kind: DeliveryFeeKind;
      amount: number;
      min_value_free_delivery: string | null;
      minimum_order_value: string | null;
      latitude: string | null;
      longitude: string | null;
      location_address: string | null;
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
      shop_delivery_distance_tiers: {
        data: Array<{
          id: string;
          type: string;
          attributes: {
            min_km: string;
            max_km: string | null;
            amount: string;
          };
        }>;
      };
    };
  };
}

const toNumber = (value: string | number | null | undefined): number | null =>
  value !== null && value !== undefined ? parseFloat(value.toString()) : null;

export const deliveryService = {
  getDeliveryConfig: async (): Promise<DeliveryConfig> => {
    const response = await api.get<ApiDeliveryConfig>("/shop_delivery_configs");
    const data = response.data.data;

    return {
      id: data.id,
      delivery_fee_kind: data.attributes.delivery_fee_kind,
      amount: data.attributes.amount,
      min_value_free_delivery: toNumber(data.attributes.min_value_free_delivery),
      minimum_order_value: toNumber(data.attributes.minimum_order_value),
      latitude: toNumber(data.attributes.latitude),
      longitude: toNumber(data.attributes.longitude),
      location_address: data.attributes.location_address,
      max_delivery_distance_km: toNumber(data.attributes.max_delivery_distance_km),
      neighborhoods: data.attributes.shop_delivery_neighborhoods.data.map(n => ({
        id: n.id,
        name: n.attributes.name,
        amount: n.attributes.amount,
        min_value_free_delivery: toNumber(n.attributes.min_value_free_delivery)
      })),
      distanceTiers: (data.attributes.shop_delivery_distance_tiers?.data ?? []).map(t => ({
        id: t.id,
        min_km: parseFloat(t.attributes.min_km),
        max_km: toNumber(t.attributes.max_km),
        amount: parseFloat(t.attributes.amount)
      }))
    };
  },

  updateDeliveryConfig: async (data: DeliveryConfigInput) => {
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
  }
};
