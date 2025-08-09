import api, { setTokenType } from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";
import { CreateOrderRequest, CustomerOrdersResponse } from "@/types/order";
import { toast } from "sonner";

export const createOrder = async (data: CreateOrderRequest) => {
  setTokenType('client');
  
  try {
    const response = await api.post(API_ENDPOINTS.ORDERS, data);
    toast.success("Pedido feito!");
    return response.data;
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    toast.error("Erro ao criar pedido");
    return null;
  }
};

export const getCustomerOrders = async (): Promise<CustomerOrdersResponse | null> => {
  setTokenType('client');
  
  try {
    const response = await api.get<CustomerOrdersResponse>(API_ENDPOINTS.ORDERS);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return null;
  }
};