"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchShopReviews, PublicReview } from "../services/reviews-service";
import { cn } from "@/lib/utils";

interface ReviewsSectionProps {
  slug: string;
  accentColor?: string | null;
}

// Hook para saber quantas reviews mostrar por "página"
function usePerPage() {
  const [perPage, setPerPage] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1024) setPerPage(3);
      else if (w >= 640) setPerPage(2);
      else setPerPage(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return perPage;
}

export default function ReviewsSection({ slug, accentColor }: ReviewsSectionProps) {
  const { data: reviews = [] } = useQuery({
    queryKey: ["shop-reviews", slug],
    queryFn: () => fetchShopReviews(slug),
    staleTime: 1000 * 60 * 5,
  });

  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const perPage = usePerPage();

  const items = reviews.slice(0, 12);
  const total = items.length;
  const totalPages = Math.ceil(total / perPage);

  const next = useCallback(() => {
    setPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const prev = useCallback(() => {
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  // Reset page quando perPage muda
  useEffect(() => {
    setPage(0);
  }, [perPage]);

  useEffect(() => {
    if (totalPages <= 1 || isPaused) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [totalPages, isPaused, next]);

  if (total === 0) return null;

  const avgRating =
    reviews.reduce((sum, r) => sum + r.attributes.rating, 0) / reviews.length;

  const startIdx = page * perPage;
  const visibleReviews = items.slice(startIdx, startIdx + perPage);

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "hoje";
    if (diffDays === 1) return "ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem. atrás`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <div
      className="mb-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-bold text-[#1B1B1B]">{avgRating.toFixed(1)}</span>
        <span className="text-xs text-gray-400">· {reviews.length} avaliações</span>
      </div>

      {/* Reviews */}
      <div className="flex items-center gap-3">
        {totalPages > 1 && (
          <button
            onClick={prev}
            className="p-1 text-gray-300 hover:text-[#1B1B1B] transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div className={cn(
          "flex-1 min-w-0 grid gap-6",
          perPage === 1 && "grid-cols-1",
          perPage === 2 && "grid-cols-2",
          perPage >= 3 && "grid-cols-3",
        )}>
          {visibleReviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              formatDate={formatRelativeDate}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <button
            onClick={next}
            className="p-1 text-gray-300 hover:text-[#1B1B1B] transition-colors cursor-pointer shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all cursor-pointer",
                i === page ? "bg-gray-800 w-3" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewItem({
  review,
  formatDate,
}: {
  review: PublicReview;
  formatDate: (date: string) => string;
}) {
  const { rating, comment, customer_name, created_at } = review.attributes;
  const displayName = customer_name?.split(" ")[0] || "Cliente";

  return (
    <div className="min-w-0">
      <p className="text-[15px] text-gray-600 leading-relaxed line-clamp-2">
        {comment
          ? <>&ldquo;{comment}&rdquo;</>
          : <span className="italic text-gray-400">Sem comentário</span>
        }
      </p>
      <div className="flex items-center gap-2 mt-1.5">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={cn(
                "w-3 h-3",
                s <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400">—</span>
        <span className="text-xs font-medium text-gray-500">{displayName}</span>
        <span className="text-xs text-gray-300">{formatDate(created_at)}</span>
      </div>
    </div>
  );
}
