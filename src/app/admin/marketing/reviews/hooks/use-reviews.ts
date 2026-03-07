import { useState, useEffect } from "react";
import { reviewService, OrderReview } from "../services/review-service";

export function useReviews() {
  const [reviews, setReviews] = useState<OrderReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewService.getReviews();
      setReviews(response.data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar avaliacoes");
      console.error("Erro ao buscar avaliacoes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.attributes.rating, 0) / reviews.length
      : 0;

  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: reviews.filter((r) => r.attributes.rating === star).length,
  }));

  return {
    reviews,
    loading,
    error,
    averageRating,
    ratingDistribution,
    refetch: fetchReviews,
  };
}
