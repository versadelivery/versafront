import api from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

// Weekly Summary
export interface WeeklySummaryBestDay {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface WeeklySummaryTopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface WeeklySummaryCurrentWeek {
  start_date: string;
  end_date: string;
  total_revenue: number;
  total_orders: number;
  average_ticket: number;
  best_day: WeeklySummaryBestDay | null;
  top_product: WeeklySummaryTopProduct | null;
}

export interface WeeklySummaryPreviousWeek {
  start_date: string;
  end_date: string;
  total_revenue: number;
  total_orders: number;
  average_ticket: number;
}

export interface WeeklySummaryComparison {
  revenue_variation: number | null;
  orders_variation: number | null;
  ticket_variation: number | null;
}

export interface WeeklySummaryResponse {
  current_week: WeeklySummaryCurrentWeek;
  previous_week: WeeklySummaryPreviousWeek;
  comparison: WeeklySummaryComparison;
}

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

// Sales by Channel
export interface SalesByChannelEntry {
  key: string;
  label: string;
  color: string;
  orders: number;
  revenue: number;
  average_ticket: number;
  order_percentage: number;
  revenue_percentage: number;
}

export interface SalesByChannelSummary {
  total_orders: number;
  total_revenue: number;
  top_channel: { label: string; orders: number; revenue: number } | null;
}

export interface SalesByChannelResponse {
  data: SalesByChannelEntry[];
  summary: SalesByChannelSummary;
}

// Discounted Orders
export interface DiscountedOrderEntry {
  id: number;
  date_label: string;
  total_items_price: number;
  discount_amount: number;
  total_price: number;
  coupon_code: string | null;
  payment_method_label: string;
}

export interface DiscountedOrdersSummary {
  total_discounted_orders: number;
  total_discount: number;
  average_discount: number;
  discount_percentage: number;
}

export interface DiscountedOrdersResponse {
  orders: DiscountedOrderEntry[];
  summary: DiscountedOrdersSummary;
}

// Average Prep Time
export interface AveragePrepTimeEntry {
  date: string;
  label: string;
  average_minutes: number;
  order_count: number;
}

export interface AveragePrepTimeSummary {
  total_orders: number;
  overall_average_minutes: number;
  best_day: { date: string; label: string; average_minutes: number } | null;
  worst_day: { date: string; label: string; average_minutes: number } | null;
}

export interface AveragePrepTimeResponse {
  data: AveragePrepTimeEntry[];
  summary: AveragePrepTimeSummary;
}

// Average Delivery Time
export interface AverageDeliveryTimeEntry {
  date: string;
  label: string;
  average_minutes: number;
  order_count: number;
}

export interface AverageDeliveryTimeSummary {
  total_orders: number;
  overall_average_minutes: number;
  best_day: { date: string; label: string; average_minutes: number } | null;
  worst_day: { date: string; label: string; average_minutes: number } | null;
}

export interface AverageDeliveryTimeResponse {
  data: AverageDeliveryTimeEntry[];
  summary: AverageDeliveryTimeSummary;
}

// Item Profitability
export interface ItemProfitabilityEntry {
  name: string;
  quantity_sold: number;
  revenue: number;
  total_cost: number;
  profit: number;
  margin_percentage: number | null;
}

export interface ItemProfitabilitySummary {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  overall_margin_percentage: number;
  items_without_cost: number;
}

export interface ItemProfitabilityResponse {
  items: ItemProfitabilityEntry[];
  summary: ItemProfitabilitySummary;
}

// Sales by User
export interface SalesByUserEntry {
  user_name: string;
  user_role: string;
  order_count: number;
  revenue: number;
  average_ticket: number;
}

export interface SalesByUserSummary {
  total_users: number;
  total_orders: number;
  total_revenue: number;
}

export interface SalesByUserResponse {
  data: SalesByUserEntry[];
  summary: SalesByUserSummary;
}

// Item Modifications
export interface ItemModificationEntry {
  order_id: number;
  date_label: string;
  item_name: string;
  action: string;
  changes: string;
  user_name: string;
}

export interface ItemModificationsSummary {
  total_modifications: number;
  total_updates: number;
  total_removals: number;
  total_orders_affected: number;
}

export interface ItemModificationsResponse {
  modifications: ItemModificationEntry[];
  summary: ItemModificationsSummary;
}

// Payment Modifications
export interface PaymentModificationEntry {
  order_id: number;
  date_label: string;
  old_payment_method: string;
  new_payment_method: string;
  user_name: string;
}

export interface PaymentModificationsSummary {
  total_modifications: number;
  total_orders_affected: number;
}

export interface PaymentModificationsResponse {
  modifications: PaymentModificationEntry[];
  summary: PaymentModificationsSummary;
}

// Cash Register Statement
export interface CashRegisterTransactionEntry {
  id: number;
  date_label: string;
  kind: string;
  kind_label: string;
  type: "entry" | "exit";
  description: string;
  amount: number;
}

export interface CashRegisterStatementSummary {
  total_entries: number;
  total_exits: number;
  balance: number;
  transaction_count: number;
}

export interface CashRegisterStatementResponse {
  transactions: CashRegisterTransactionEntry[];
  summary: CashRegisterStatementSummary;
}

// Visitors
export interface VisitorBreakdownItem {
  date: string;
  label: string;
  unique_visitors: number;
}

export interface VisitorsSummary {
  total_unique_visitors: number;
  total_orders: number;
  conversion_rate_percentage: number;
}

export interface VisitorsResponse {
  breakdown: VisitorBreakdownItem[];
  summary: VisitorsSummary;
}

// Delivery Fees
export interface DeliveryFeeEntry {
  delivery_person: string;
  order_count: number;
  total_fees: number;
  average_fee: number;
}

export interface DeliveryFeesSummary {
  total_deliveries: number;
  total_fees: number;
  average_fee: number;
  total_drivers: number;
}

export interface DeliveryFeesResponse {
  data: DeliveryFeeEntry[];
  summary: DeliveryFeesSummary;
}

// Coupon Usage
export interface CouponUsageEntry {
  code: string;
  discount_type_label: string;
  value: number;
  usage_count_period: number;
  total_discount_given: number;
  total_orders_revenue: number;
}

export interface CouponUsageSummary {
  total_coupons_used: number;
  total_orders_with_coupon: number;
  total_discount_given: number;
  average_discount_per_order: number;
}

export interface CouponUsageResponse {
  coupons: CouponUsageEntry[];
  summary: CouponUsageSummary;
}

export const reportsService = {
  getWeeklySummary: async (): Promise<WeeklySummaryResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.WEEKLY_SUMMARY);
    return response.data;
  },

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

  getSalesByChannel: async (
    startDate: string,
    endDate: string
  ): Promise<SalesByChannelResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.SALES_BY_CHANNEL, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getDiscountedOrders: async (
    startDate: string,
    endDate: string
  ): Promise<DiscountedOrdersResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.DISCOUNTED_ORDERS, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getAveragePrepTime: async (
    startDate: string,
    endDate: string
  ): Promise<AveragePrepTimeResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.AVERAGE_PREP_TIME, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getAverageDeliveryTime: async (
    startDate: string,
    endDate: string
  ): Promise<AverageDeliveryTimeResponse> => {
    const response = await api.get(
      API_ENDPOINTS.REPORTS.AVERAGE_DELIVERY_TIME,
      {
        params: { start_date: startDate, end_date: endDate },
      }
    );
    return response.data;
  },

  getItemProfitability: async (
    startDate: string,
    endDate: string
  ): Promise<ItemProfitabilityResponse> => {
    const response = await api.get(
      API_ENDPOINTS.REPORTS.ITEM_PROFITABILITY,
      {
        params: { start_date: startDate, end_date: endDate },
      }
    );
    return response.data;
  },

  getSalesByUser: async (
    startDate: string,
    endDate: string
  ): Promise<SalesByUserResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.SALES_BY_USER, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getItemModifications: async (
    startDate: string,
    endDate: string
  ): Promise<ItemModificationsResponse> => {
    const response = await api.get(
      API_ENDPOINTS.REPORTS.ITEM_MODIFICATIONS,
      {
        params: { start_date: startDate, end_date: endDate },
      }
    );
    return response.data;
  },

  getPaymentModifications: async (
    startDate: string,
    endDate: string
  ): Promise<PaymentModificationsResponse> => {
    const response = await api.get(
      API_ENDPOINTS.REPORTS.PAYMENT_MODIFICATIONS,
      {
        params: { start_date: startDate, end_date: endDate },
      }
    );
    return response.data;
  },

  getCashRegisterStatement: async (
    startDate: string,
    endDate: string
  ): Promise<CashRegisterStatementResponse> => {
    const response = await api.get(
      API_ENDPOINTS.REPORTS.CASH_REGISTER_STATEMENT,
      {
        params: { start_date: startDate, end_date: endDate },
      }
    );
    return response.data;
  },

  getVisitors: async (
    startDate: string,
    endDate: string
  ): Promise<VisitorsResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.VISITORS, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getDeliveryFees: async (
    startDate: string,
    endDate: string
  ): Promise<DeliveryFeesResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.DELIVERY_FEES, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getCouponUsage: async (
    startDate: string,
    endDate: string
  ): Promise<CouponUsageResponse> => {
    const response = await api.get(API_ENDPOINTS.REPORTS.COUPON_USAGE, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },
};
