import api, { setTokenType } from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";
import { CreateOrderRequest } from "@/types/order";
import { toast } from "sonner";

export const createOrder = async (data: CreateOrderRequest) => {
  console.log('pedido data', data);
  
  setTokenType('client');
  
  try {
    const response = await api.post(API_ENDPOINTS.ORDERS, data);
    toast.success("Pedido criado com sucesso");
    return response.data;
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    toast.error("Erro ao criar pedido");
    return null;
  }
};