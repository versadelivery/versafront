"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchShopReviews } from "../services/reviews-service";
import { cn } from "@/lib/utils";

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

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const items = reviews.slice(0, 10);
  const total = items.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [total, isPaused, next]);

  if (total === 0) return null;

  const avgRating =
    reviews.reduce((sum, r) => sum + r.attributes.rating, 0) / reviews.length;

  const review = items[current];
  const { rating, comment, customer_name, created_at } = review.attributes;
  const displayName = customer_name?.split(" ")[0] || "Cliente";

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

      {/* Review atual */}
      <div className="flex items-center gap-4">
        {total > 1 && (
          <button
            onClick={prev}
            className="p-1 text-gray-300 hover:text-[#1B1B1B] transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-[15px] text-gray-600 leading-relaxed">
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
            <span className="text-xs text-gray-300">{formatRelativeDate(created_at)}</span>
          </div>
        </div>

        {total > 1 && (
          <button
            onClick={next}
            className="p-1 text-gray-300 hover:text-[#1B1B1B] transition-colors cursor-pointer shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all cursor-pointer",
                i === current ? "bg-gray-800 w-3" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
