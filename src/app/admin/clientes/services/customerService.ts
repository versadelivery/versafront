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
    orders_count: number;
    created_at: string;
  };
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
    email: string;
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
};
