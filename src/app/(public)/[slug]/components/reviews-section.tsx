"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { StarRating } from "@/components/star-rating";
import { fetchShopReviews, PublicReview } from "../services/reviews-service";

interface ReviewsSectionProps {
  slug: string;
  accentColor?: string | null;
}

export default function ReviewsSection({ slug, accentColor }: ReviewsSectionProps) {
  const { data: reviews = [] } = useQuery({
    queryKey: ["shop-reviews", slug],
    queryFn: () => fetchShopReviews(slug),
    staleTime: 1000 * 60 * 5,
  });

  if (reviews.length === 0) return null;

  const avgRating =
    reviews.reduce((sum, r) => sum + r.attributes.rating, 0) / reviews.length;

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "hoje";
    if (diffDays === 1) return "ontem";
    if (diffDays < 7) return `${diffDays} dias atras`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem. atras`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold" style={accentColor ? { color: accentColor } : undefined}>
          O que nossos clientes dizem
        </h3>
        <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-full">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold text-yellow-700">
            {avgRating.toFixed(1)}
          </span>
          <span className="text-xs text-yellow-600">
            ({reviews.length})
          </span>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
        {reviews.slice(0, 10).map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            formatDate={formatRelativeDate}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  formatDate,
}: {
  review: PublicReview;
  formatDate: (date: string) => string;
}) {
  const { rating, comment, customer_name, created_at } = review.attributes;
  const displayName = customer_name
    ? customer_name.split(" ")[0]
    : "Cliente";

  return (
    <Card className="min-w-[220px] max-w-[280px] p-4 shrink-0 shadow-none border bg-white">
      <div className="flex items-center justify-between mb-2">
        <StarRating rating={rating} size={14} />
        <span className="text-xs text-muted-foreground">
          {formatDate(created_at)}
        </span>
      </div>
      {comment && (
        <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
          &ldquo;{comment}&rdquo;
        </p>
      )}
      <p className="text-xs font-medium text-foreground">{displayName}</p>
    </Card>
  );
}
