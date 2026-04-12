export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
  // Auth & General
  LOGIN: "/login",
  SHOPS: "/shops",
  FORGOT_PASSWORD: "/forgot_password",
  RESET_PASSWORD: "/reset_password",

  // Catalog
  CATALOG: "/catalog_groups",
  CATALOG_ITEMS: "/catalog_items",

  // Ingredients
  INGREDIENTS: "/ingredients",

  // Orders
  ORDERS: "/orders",
  ADMIN_ORDERS: "/orders",

  // Delivery person
  DELIVERY_ORDERS: "/delivery/orders",
  
  // Order Flow Config
  ORDER_FLOW_CONFIG: "/shop_order_flow_configs",

  // Customers
  CUSTOMERS: {
    LOGIN: "/customers/login",
    REGISTER: "/customers/register",
    ORDERS: "/customers/orders",
  },

  // Admin Customers
  ADMIN_CUSTOMERS: "/admin_customers",

  // Coupons
  COUPONS: "/coupons",
  VALIDATE_COUPON: "/coupons/validate",

  // Reviews
  ORDER_REVIEWS: "/order_reviews",
  REVIEWS: "/reviews",

  // Tables
  TABLES: "/tables",
  TABLES_UPDATE_POSITIONS: "/tables/update_positions",

  // Table Sessions
  TABLE_SESSIONS: "/table_sessions",
  TABLE_SESSIONS_OPEN: "/table_sessions/open",

  // Cash Register
  CASH_REGISTERS: "/cash_registers",
  CASH_REGISTER_OPEN: "/cash_registers/open",
  CASH_REGISTER_CLOSE: "/cash_registers/close",
  CASH_REGISTER_MANUAL_ENTRY: "/cash_registers/manual_entry",

  // Reports
  REPORTS: {
    WEEKLY_SUMMARY: "/reports/weekly_summary",
    MONTHLY_REVENUE: "/reports/monthly_revenue",
    SALES_BY_PERIOD: "/reports/sales_by_period",
    AVERAGE_TICKET: "/reports/average_ticket",
    SALES_BY_ITEM: "/reports/sales_by_item",
    TOP_CUSTOMERS: "/reports/top_customers",
    PAYMENT_METHODS: "/reports/payment_methods",
    SALES_BY_HOUR: "/reports/sales_by_hour",
    SALES_BY_WEEKDAY: "/reports/sales_by_weekday",
    SALES_BY_NEIGHBORHOOD: "/reports/sales_by_neighborhood",
    CUSTOMER_ACQUISITION: "/reports/customer_acquisition",
    SALES_BY_CHANNEL: "/reports/sales_by_channel",
    DISCOUNTED_ORDERS: "/reports/discounted_orders",
    AVERAGE_PREP_TIME: "/reports/average_prep_time",
    AVERAGE_DELIVERY_TIME: "/reports/average_delivery_time",
    ITEM_PROFITABILITY: "/reports/item_profitability",
    SALES_BY_USER: "/reports/sales_by_user",
    ITEM_MODIFICATIONS: "/reports/item_modifications",
    PAYMENT_MODIFICATIONS: "/reports/payment_modifications",
    CASH_REGISTER_STATEMENT: "/reports/cash_register_statement",
    VISITORS: "/reports/visitors",
    DELIVERY_FEES: "/reports/delivery_fees",
    COUPON_USAGE: "/reports/coupon_usage",
    ORDERS_BY_PAYMENT_METHOD: "/reports/orders_by_payment_method",
  },

  // Fiscal
  FISCAL: {
    CONFIG: "/shop_fiscal_configs",
    NOTES: "/fiscal_notes",
    RETRY: (id: string) => `/fiscal_notes/${id}/retry`,
  },
};
