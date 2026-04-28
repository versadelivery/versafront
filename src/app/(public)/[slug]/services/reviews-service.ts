import { API_BASE_URL } from "@/api/routes";

export interface PublicReview {
  id: string;
  type: string;
  attributes: {
    rating: number;
    comment: string | null;
    customer_name: string | null;
    created_at: string;
  };
}

export async function fetchShopReviews(slug: string): Promise<PublicReview[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/customers/shops/${slug}/order_reviews`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}
