import api from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

export interface OrderReview {
  id: string;
  type: string;
  attributes: {
    rating: number;
    comment: string | null;
    order_id: number;
    customer_name: string | null;
    created_at: string;
  };
}

export interface OrderReviewsResponse {
  data: OrderReview[];
}

export const reviewService = {
  getReviews: async (): Promise<OrderReviewsResponse> => {
    const response = await api.get(API_ENDPOINTS.ORDER_REVIEWS);
    return response.data;
  },
};
