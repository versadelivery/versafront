import api from "@/api/config";

export interface ShopAttributes {
  cellphone: string;
  name: string;
  slug: string;
  address: string | null;
  description: string | null;
  email: string | null;
  image?: File | string | any;
  image_url?: string | any;
  auto_accept_orders?: boolean;
  auto_open_cash_register?: boolean;
  auto_open_cash_register_time?: string | null;
  welcome_message?: string | null;
  banner_text?: string | null;
  banner_active?: boolean;
  header_color?: string | null;
  background_color?: string | null;
  group_color?: string | null;
  catalog_layout?: string | null;
  accent_color?: string | null;
  estimated_prep_time?: number | null;
  estimated_delivery_time?: number | null;
}

export interface ShopResponse {
  data: {
    id: string;
    type: string;
    attributes: ShopAttributes;
  };
}

export const shopService = {
  getShop: async () => {
    const response = await api.get<ShopResponse>("/shops");
    return response.data;
  },

  updateShop: async (data: { shop: Partial<ShopAttributes> }) => {
    const formData = new FormData();
    
    Object.entries(data.shop).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'image' && value instanceof File) {
          formData.append('shop[image]', value);
        } else {
          formData.append(`shop[${key}]`, value);
        }
      }
    });
    const response = await api.put<ShopResponse>("/shops", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  },
}; 