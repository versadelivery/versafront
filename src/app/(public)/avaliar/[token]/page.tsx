"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { StarRating } from "@/components/star-rating";
import { API_BASE_URL } from "@/api/routes";

interface ReviewInfo {
  order_id: number;
  shop_name: string;
  shop_image: string | null;
}

interface AlreadyReviewedInfo {
  already_reviewed: true;
  review: {
    data: {
      attributes: {
        rating: number;
        comment: string | null;
      };
    };
  };
}

type ReviewData = ReviewInfo | AlreadyReviewedInfo;

export default function ReviewPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchReviewInfo() {
      try {
        const response = await fetch(`${API_BASE_URL}/reviews/${token}`);
        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Link de avaliacao invalido");
          return;
        }
        const data = await response.json();
        setReviewData(data);
      } catch {
        setError("Erro ao carregar dados da avaliacao");
      } finally {
        setLoading(false);
      }
    }
    fetchReviewInfo();
  }, [token]);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_token: token,
          rating,
          comment: comment.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Erro ao enviar avaliacao");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Erro ao enviar avaliacao");
    } finally {
      setSubmitting(false);
    }
  };

  const isAlreadyReviewed =
    reviewData && "already_reviewed" in reviewData && reviewData.already_reviewed;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Ops!</h2>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  if (submitted || isAlreadyReviewed) {
    const existingReview = isAlreadyReviewed
      ? (reviewData as AlreadyReviewedInfo).review.data.attributes
      : null;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            Obrigado pela sua avaliacao!
          </h2>
          <p className="text-muted-foreground mb-4">
            Sua opiniao nos ajuda a melhorar nossos servicos.
          </p>
          <StarRating
            rating={existingReview ? existingReview.rating : rating}
            size={28}
            className="justify-center"
          />
        </Card>
      </div>
    );
  }

  const info = reviewData as ReviewInfo;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="p-6 md:p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-1">
            Como foi seu pedido?
          </h2>
          <p className="text-muted-foreground text-sm">
            Avalie seu pedido #{info.order_id} em{" "}
            <span className="font-medium text-foreground">
              {info.shop_name}
            </span>
          </p>
        </div>

        {/* Star rating */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <StarRating
            rating={rating}
            size={36}
            interactive
            onChange={setRating}
          />
          <p className="text-sm text-muted-foreground">
            {rating === 0
              ? "Toque nas estrelas para avaliar"
              : rating <= 2
              ? "Que pena! Conte-nos o que houve."
              : rating <= 3
              ? "Podemos melhorar!"
              : rating === 4
              ? "Muito bom!"
              : "Excelente!"}
          </p>
        </div>

        {/* Comment */}
        <Textarea
          placeholder="Deixe um comentario (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mb-6 min-h-[100px] resize-none"
        />

        {/* Submit */}
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12"
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Enviar avaliacao
        </Button>
      </Card>
    </div>
  );
}
