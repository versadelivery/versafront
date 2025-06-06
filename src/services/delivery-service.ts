import api from "@/api/config";

export interface DeliveryNeighborhood {
  id: string;
  name: string;
  amount: number;
  min_value_free_delivery: number | null;
}

export interface DeliveryConfig {
  id: string;
  delivery_fee_kind: "to_be_agreed" | "fixed" | "per_neighborhood";
  amount: number;
  min_value_free_delivery: number | null;
  neighborhoods: DeliveryNeighborhood[];
}

interface ApiDeliveryConfig {
  data: {
    id: string;
    type: string;
    attributes: {
      delivery_fee_kind: "to_be_agreed" | "fixed" | "per_neighborhood";
      amount: number;
      min_value_free_delivery: string | null;
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
      min_value_free_delivery: data.attributes.min_value_free_delivery ? parseFloat(data.attributes.min_value_free_delivery) : null,
      neighborhoods: data.attributes.shop_delivery_neighborhoods.data.map(n => ({
        id: n.id,
        name: n.attributes.name,
        amount: n.attributes.amount,
        min_value_free_delivery: n.attributes.min_value_free_delivery ? parseFloat(n.attributes.min_value_free_delivery) : null
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
  }
}; 