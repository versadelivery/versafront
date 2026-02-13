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
  whatsapp_order_confirmation_template?: string | null;
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