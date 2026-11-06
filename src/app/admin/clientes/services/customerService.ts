import api from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

export interface Customer {
  id: string;
  type: string;
  attributes: {
    id: number;
    name: string;
    email: string;
    cellphone: string;
    blocked: boolean;
    orders_count: number;
    created_at: string;
    last_address?: CustomerLastAddress | null;
    addresses?: CustomerSavedAddress[] | null;
  };
}

export interface CustomerLastAddress {
  address: string;
  number: string | null;
  neighborhood: string | null;
  shop_delivery_neighborhood_id: number | null;
  complement: string | null;
  reference: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface CustomerSavedAddress extends CustomerLastAddress {
  id: number;
  is_default: boolean;
}

export interface CustomerOrderSummary {
  id: string;
  type: string;
  attributes: {
    id: number;
    status: string;
    total_price: string;
    total_items_price: string;
    delivery_fee: string;
    withdrawal: boolean;
    payment_method: string;
    created_at: string;
    paid_at: string | null;
    items_count: number;
  };
}

export interface CustomersResponse {
  data: Customer[];
}

export interface CustomerDetailResponse {
  customer: { data: Customer };
  orders: { data: CustomerOrderSummary[] };
}

export interface CreateCustomerRequest {
  customer: {
    name: string;
    // opcional: no PDV o cliente é cadastrado só com nome e telefone
    email?: string;
    cellphone: string;
  };
}

export interface UpdateCustomerRequest {
  customer: {
    name?: string;
    email?: string;
    cellphone?: string;
  };
}

export const customerService = {
  getCustomers: async (search?: string): Promise<CustomersResponse> => {
    const params = search ? { search } : {};
    const response = await api.get(API_ENDPOINTS.ADMIN_CUSTOMERS, { params });
    return response.data;
  },

  // PDV: busca por nome/telefone já trazendo o último endereço de entrega (máx. 20)
  searchCustomers: async (search: string): Promise<CustomersResponse> => {
    const response = await api.get(API_ENDPOINTS.ADMIN_CUSTOMERS, { params: { search, with_last_address: 1 } });
    return response.data;
  },

  getCustomer: async (id: string): Promise<CustomerDetailResponse> => {
    const response = await api.get(`${API_ENDPOINTS.ADMIN_CUSTOMERS}/${id}`);
    return response.data;
  },

  createCustomer: async (data: CreateCustomerRequest): Promise<{ data: Customer }> => {
    const response = await api.post(API_ENDPOINTS.ADMIN_CUSTOMERS, data);
    return response.data;
  },

  updateCustomer: async (id: string, data: UpdateCustomerRequest): Promise<{ data: Customer }> => {
    const response = await api.put(`${API_ENDPOINTS.ADMIN_CUSTOMERS}/${id}`, data);
    return response.data;
  },

  toggleBlock: async (id: string, blocked: boolean): Promise<{ data: Customer }> => {
    const response = await api.patch(`${API_ENDPOINTS.ADMIN_CUSTOMERS}/${id}/toggle_block`, { blocked });
    return response.data;
  },

  getOrder: async (orderId: string): Promise<{ data: any }> => {
    const response = await api.get(`${API_ENDPOINTS.ORDERS}/${orderId}`);
    return response.data;
  },
};
