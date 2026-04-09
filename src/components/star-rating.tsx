"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  size = 20,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={cn(
            "transition-colors",
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-300",
            interactive && "cursor-pointer hover:text-yellow-400"
          )}
          onClick={() => {
            if (interactive && onChange) {
              onChange(star);
            }
          }}
        />
      ))}
    </div>
  );
}
