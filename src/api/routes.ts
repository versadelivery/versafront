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

  // Orders
  ORDERS: "/orders",
  ADMIN_ORDERS: "/orders",
  
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

  // Cash Register
  CASH_REGISTERS: "/cash_registers",
  CASH_REGISTER_OPEN: "/cash_registers/open",
  CASH_REGISTER_CLOSE: "/cash_registers/close",
  CASH_REGISTER_MANUAL_ENTRY: "/cash_registers/manual_entry",
};
