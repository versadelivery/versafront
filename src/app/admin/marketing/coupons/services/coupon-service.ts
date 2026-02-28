import api from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

export interface Coupon {
  id: string;
  type: string;
  attributes: {
    code: string;
    discount_type: "fixed_value" | "percentage";
    value: string;
    minimum_order_value: string;
    usage_limit: number | null;
    usage_count: number;
    starts_at: string | null;
    expires_at: string | null;
    active: boolean;
    usable: boolean;
    expired: boolean;
    exhausted: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface CreateCouponPayload {
  code: string;
  discount_type: "fixed_value" | "percentage";
  value: number;
  minimum_order_value: number;
  usage_limit: number | null;
  starts_at: string | null;
  expires_at: string | null;
  active: boolean;
}

export interface UpdateCouponPayload {
  code?: string;
  discount_type?: "fixed_value" | "percentage";
  value?: number;
  minimum_order_value?: number;
  usage_limit?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  active?: boolean;
}

export interface CouponsResponse {
  data: Coupon[];
}

export interface CouponResponse {
  data: Coupon;
}

export const couponService = {
  getCoupons: async (): Promise<CouponsResponse> => {
    const response = await api.get(API_ENDPOINTS.COUPONS);
    return response.data;
  },

  createCoupon: async (data: CreateCouponPayload): Promise<CouponResponse> => {
    const response = await api.post(API_ENDPOINTS.COUPONS, data);
    return response.data;
  },

  updateCoupon: async (id: string, data: UpdateCouponPayload): Promise<CouponResponse> => {
    const response = await api.put(`${API_ENDPOINTS.COUPONS}/${id}`, data);
    return response.data;
  },

  deleteCoupon: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`${API_ENDPOINTS.COUPONS}/${id}`);
    return response.data;
  },
};
