export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
  LOGIN: "/login",
  SHOPS: "/shops",
  ORDERS: "/orders",
  CUSTOMERS: {
    LOGIN: "/customers/login",
    REGISTER: "/customers/register",
    ORDERS: "/customers/orders",
  },
};

