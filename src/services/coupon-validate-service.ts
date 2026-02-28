import api from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

export interface ValidateCouponData {
  code: string;
  discount_type: "fixed_value" | "percentage";
  value: string;
  minimum_order_value: string;
}

export interface ValidateCouponResponse {
  data: {
    id: string;
    type: string;
    attributes: ValidateCouponData & {
      usable: boolean;
      expired: boolean;
      exhausted: boolean;
    };
  };
}

export async function validateCoupon(
  code: string,
  shopId: number
): Promise<ValidateCouponResponse> {
  const response = await api.post<ValidateCouponResponse>(
    API_ENDPOINTS.VALIDATE_COUPON,
    { code, shop_id: shopId }
  );
  return response.data;
}
