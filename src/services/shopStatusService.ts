import api from "@/api/config";

export interface ShopStatusResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      is_open: boolean;
      current_time: string;
      timezone: string;
    };
  };
}

export const shopStatusService = {
  // Verificar status da loja
  getStatus: async (): Promise<ShopStatusResponse> => {
    const response = await api.get('/shops/status');
    return response.data;
  }
};
