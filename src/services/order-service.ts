import api, { setTokenType } from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";
import { CreateOrderRequest, CustomerOrdersResponse } from "@/types/order";

export const createOrder = async (data: CreateOrderRequest, type: 'normal' | 'client' = 'client') => {
  setTokenType(type);
  
  const endpoint = type === 'client' ? API_ENDPOINTS.CUSTOMERS.ORDERS : API_ENDPOINTS.ORDERS;
  
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
};

export const createPDVOrder = async (data: CreateOrderRequest) => {
  setTokenType('admin');
  
  try {
    const response = await api.post(API_ENDPOINTS.ADMIN_ORDERS, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar pedido no PDV:', error);
    throw error;
  }
};

export const getCustomerOrders = async (): Promise<CustomerOrdersResponse | null> => {
  setTokenType('client');
  
  try {
    const response = await api.get<CustomerOrdersResponse>(API_ENDPOINTS.CUSTOMERS.ORDERS);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return null;
  }
};