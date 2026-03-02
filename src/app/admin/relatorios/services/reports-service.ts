import api from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

export interface MonthlyRevenueItem {
  year: number;
  month: number;
  label: string;
  revenue: number;
  variation_percentage: number | null;
}

export interface RevenueSummary {
  total_revenue: number;
  average_monthly: number;
  best_month: { label: string; revenue: number } | null;
  current_month: { label: string; revenue: number };
}

export interface MonthlyRevenueResponse {
  data: MonthlyRevenueItem[];
  summary: RevenueSummary;
}

export interface DailyBreakdownItem {
  date: string;
  label: string;
  orders: number;
  revenue: number;
}

export interface PeriodMetrics {
  start_date: string;
  end_date: string;
  total_orders: number;
  gross_revenue: number;
  average_ticket: number;
}

export interface CurrentPeriodMetrics extends PeriodMetrics {
  daily_breakdown: DailyBreakdownItem[];
}

export interface PeriodComparison {
  orders_variation: number | null;
  revenue_variation: number | null;
  ticket_variation: number | null;
}

export interface SalesByPeriodData {
  current_period: CurrentPeriodMetrics;
  previous_period: PeriodMetrics;
  comparison: PeriodComparison;
}

export interface SalesByPeriodResponse {
  data: SalesByPeriodData;
}

// Average Ticket
export interface AverageTicketBreakdownItem {
  period: string;
  label: string;
  orders: number;
  revenue: number;
  average_ticket: number;
}

export interface AverageTicketSummary {
  total_orders: number;
  gross_revenue: number;
  average_ticket: number;
}

export interface AverageTicketResponse {
  summary: AverageTicketSummary;
  breakdown: AverageTicketBreakdownItem[];
}

// Sales by Item
export interface SalesItemEntry {
  name: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

export interface SalesByItemResponse {
  items: SalesItemEntry[];
  groups: SalesItemEntry[];
}

// Top Customers
export interface TopCustomerEntry {
  name: string;
  phone: string | null;
  order_count: number;
  total_spent: number;
}

export interface TopCustomersSummary {
  total_unique_customers: number;
  total_revenue: number;
  average_per_customer: number;
}

export interface TopCustomersResponse {
  customers: TopCustomerEntry[];
  summary: TopCustomersSummary;
}

// Payment Methods
export interface PaymentMethodEntry {
  key: string;
  label: string;
  color: string;
  order_count: number;
  revenue: number;
  order_percentage: number;
  revenue_percentage: number;
}

export interface PaymentMethodsSummary {
  total_orders: number;
  total_revenue: number;
}

export interface PaymentMethodsResponse {
  data: PaymentMethodEntry[];
  summary: PaymentMethodsSummary;
}

// Sales by Hour
export interface SalesByHourEntry {
  hour: number;
  label: string;
  orders: number;
  revenue: number;
  order_percentage: number;
  revenue_percentage: number;
}

export interface SalesByHourSummary {
  total_orders: number;
  total_revenue: number;
  peak_hour: { label: string; orders: number; revenue: number } | null;
}

export interface SalesByHourResponse {
  data: SalesByHourEntry[];
  summary: SalesByHourSummary;
}

// Sales by Weekday
export interface SalesByWeekdayEntry {
  weekday: number;
  label: string;
  short_label: string;
  orders: number;
  revenue: number;
  average_ticket: number;
  order_percentage: number;
  revenue_percentage: number;
}

export interface SalesByWeekdaySummary {
  total_orders: number;
  total_revenue: number;
  best_day: { label: string; orders: number; revenue: number } | null;
}

export interface SalesByWeekdayResponse {
  data: SalesByWeekdayEntry[];
  summary: SalesByWeekdaySummary;
}

// Sales by Neighborhood
export interface SalesByNeighborhoodEntry {
  neighborhood: string;
  orders: number;
  revenue: number;
  average_ticket: number;
  order_percentage: number;
  revenue_percentage: number;
}

export interface SalesByNeighborhoodSummary {
  total_orders: number;
  total_revenue: number;
  total_neighborhoods: number;
  top_neighborhood: SalesByNeighborhoodEntry | null;
}

export interface SalesByNeighborhoodResponse {
  data: SalesByNeighborhoodEntry[];
  summary: SalesByNeighborhoodSummary;
}

// Customer Acquisition
export interface CustomerAcquisitionBreakdownItem {
  date: string;
  label: string;
  new_customers: number;
}

export interface CustomerAcquisitionSummary {
  new_customers: number;
  new_customers_revenue: number;
  returning_customers: number;
  total_orders: number;
  new_customer_percentage: number;
  average_first_order: number;
}

export interface CustomerAcquisitionResponse {
  breakdown: CustomerAcquisitionBreakdownItem[];
  summary: CustomerAcquisitionSummary;
}

export const reportsService = {
  getMonthlyRevenue: async (
    months?: number
  ): Promise<MonthlyRevenueResponse> => {
    const params = months ? { months } : {};
    const response = await api.get(API_ENDPOINTS.REPORTS.MONTHLY_REVENUE, {
      params,
    });
    return response.data;
  },

  getSalesByPeriod: async (
    startDate: string,
    endDate: string
  ): Promise<SalesByPeriodResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.SALES_BY_PERIOD, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getAverageTicket: async (
    startDate: string,
    endDate: string,
    granularity?: string
  ): Promise<AverageTicketResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.AVERAGE_TICKET, {
      params: { start_date: startDate, end_date: endDate, granularity },
    });
    return response.data;
  },

  getSalesByItem: async (
    startDate: string,
    endDate: string
  ): Promise<SalesByItemResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.SALES_BY_ITEM, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getTopCustomers: async (
    startDate: string,
    endDate: string
  ): Promise<TopCustomersResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.TOP_CUSTOMERS, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getPaymentMethods: async (
    startDate: string,
    endDate: string
  ): Promise<PaymentMethodsResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.PAYMENT_METHODS, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getSalesByHour: async (
    startDate: string,
    endDate: string
  ): Promise<SalesByHourResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.SALES_BY_HOUR, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getSalesByWeekday: async (
    startDate: string,
    endDate: string
  ): Promise<SalesByWeekdayResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.SALES_BY_WEEKDAY, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getSalesByNeighborhood: async (
    startDate: string,
    endDate: string
  ): Promise<SalesByNeighborhoodResponse> => {
    const response = await api.get(
      API_ENDPOINTS.REPORTS.SALES_BY_NEIGHBORHOOD,
      {
        params: { start_date: startDate, end_date: endDate },
      }
    );
    return response.data;
  },

  getCustomerAcquisition: async (
    startDate: string,
    endDate: string
  ): Promise<CustomerAcquisitionResponse> => {
    const response = await api.get(
      API_ENDPOINTS.REPORTS.CUSTOMER_ACQUISITION,
      {
        params: { start_date: startDate, end_date: endDate },
      }
    );
    return response.data;
  },
};
