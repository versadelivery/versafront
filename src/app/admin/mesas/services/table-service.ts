import api from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

export interface TableAttributes {
  number: number;
  label: string | null;
  capacity: number;
  position_x: number;
  position_y: number;
  active: boolean;
  shape: "square" | "round" | "rectangle";
  occupied: boolean;
  current_session: TableSessionResponse | null;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: string;
  type: string;
  attributes: TableAttributes;
}

export interface TableSessionOrderItem {
  name: string;
  quantity: number;
}

export interface TableSessionOrderSummary {
  id: number;
  status: string;
  total_price: string;
  items_count: number;
  items: TableSessionOrderItem[];
  created_at: string;
}

export interface TableSessionAttributes {
  opened_at: string;
  closed_at: string | null;
  status: "open" | "closed";
  customer_name: string | null;
  customer_count: number;
  notes: string | null;
  total_amount: string;
  service_fee_amount: string | null;
  duration_minutes: number;
  table_number: number;
  table_label: string | null;
  opened_by_name: string;
  closed_by_name: string | null;
  orders_total: string;
  orders_count: number;
  orders: TableSessionOrderSummary[];
  created_at: string;
  updated_at: string;
}

export interface TableSession {
  id: string;
  type: string;
  attributes: TableSessionAttributes;
}

export interface TableSessionResponse {
  id: string;
  type: string;
  attributes: TableSessionAttributes;
}

export interface CreateTablePayload {
  number: number;
  label?: string;
  capacity: number;
  shape: "square" | "round" | "rectangle";
  active: boolean;
}

export interface UpdateTablePayload {
  number?: number;
  label?: string;
  capacity?: number;
  shape?: "square" | "round" | "rectangle";
  active?: boolean;
  position_x?: number;
  position_y?: number;
}

export interface UpdatePositionsPayload {
  positions: { id: string; position_x: number; position_y: number }[];
}

export interface OpenTableSessionPayload {
  table_id: string;
  customer_name?: string;
  customer_count?: number;
  notes?: string;
}

export interface CloseTableSessionPayload {
  total_amount: number;
  notes?: string;
}

export interface TableSessionFilters {
  status?: "open" | "closed";
  table_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface TablesResponse {
  data: Table[];
}

export interface TableResponse {
  data: Table;
}

export interface TableSessionsResponse {
  data: TableSession[];
}

export interface TableSessionSingleResponse {
  data: TableSession;
}

export const tableService = {
  getTables: async (): Promise<TablesResponse> => {
    const response = await api.get(API_ENDPOINTS.TABLES);
    return response.data;
  },

  createTable: async (data: CreateTablePayload): Promise<TableResponse> => {
    const response = await api.post(API_ENDPOINTS.TABLES, data);
    return response.data;
  },

  updateTable: async (id: string, data: UpdateTablePayload): Promise<TableResponse> => {
    const response = await api.put(`${API_ENDPOINTS.TABLES}/${id}`, data);
    return response.data;
  },

  deleteTable: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`${API_ENDPOINTS.TABLES}/${id}`);
    return response.data;
  },

  updatePositions: async (data: UpdatePositionsPayload): Promise<{ message: string }> => {
    const response = await api.patch(API_ENDPOINTS.TABLES_UPDATE_POSITIONS, data);
    return response.data;
  },

  getTableSessions: async (filters?: TableSessionFilters): Promise<TableSessionsResponse> => {
    const response = await api.get(API_ENDPOINTS.TABLE_SESSIONS, { params: filters });
    return response.data;
  },

  getTableSession: async (id: string): Promise<TableSessionSingleResponse> => {
    const response = await api.get(`${API_ENDPOINTS.TABLE_SESSIONS}/${id}`);
    return response.data;
  },

  openTableSession: async (data: OpenTableSessionPayload): Promise<TableSessionSingleResponse> => {
    const response = await api.post(API_ENDPOINTS.TABLE_SESSIONS_OPEN, data);
    return response.data;
  },

  closeTableSession: async (id: string, data: CloseTableSessionPayload): Promise<TableSessionSingleResponse> => {
    const response = await api.post(`${API_ENDPOINTS.TABLE_SESSIONS}/${id}/close`, data);
    return response.data;
  },
};
