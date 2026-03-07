"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Star, MessageSquare, ArrowLeft } from "lucide-react";
import { StarRating } from "@/components/star-rating";
import { useReviews } from "./hooks/use-reviews";

export default function ReviewsPage() {
  const { reviews, loading, averageRating, ratingDistribution } = useReviews();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const filteredReviews = reviews.filter((review) => {
    const attrs = review.attributes;
    const matchesSearch =
      !searchTerm ||
      (attrs.customer_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (attrs.comment || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = !filterRating || attrs.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/admin/marketing" className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </a>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">Avaliações</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 md:p-0">
          <Card className="p-4 shadow-none border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {averageRating > 0 ? averageRating.toFixed(1) : "-"}
                </p>
                <p className="text-sm text-muted-foreground">Nota media</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-none border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviews.length}</p>
                <p className="text-sm text-muted-foreground">
                  Total de avaliacoes
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-none border">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {ratingDistribution.map(({ star, count }) => (
                  <div key={star} className="text-center">
                    <p className="text-xs font-medium">{count}</p>
                    <div className="flex items-center gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        {star}
                      </span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 md:p-6 shadow-none border-none rounded-xs bg-white">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por cliente ou comentario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-muted"
              />
            </div>

            <div className="flex gap-2">
              <Badge
                variant={filterRating === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilterRating(null)}
              >
                Todas
              </Badge>
              {[5, 4, 3, 2, 1].map((star) => (
                <Badge
                  key={star}
                  variant={filterRating === star ? "default" : "outline"}
                  className="cursor-pointer gap-1"
                  onClick={() =>
                    setFilterRating(filterRating === star ? null : star)
                  }
                >
                  {star} <Star className="w-3 h-3 fill-current" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground py-4">
                    Pedido
                  </TableHead>
                  <TableHead className="font-semibold text-foreground py-4">
                    Cliente
                  </TableHead>
                  <TableHead className="font-semibold text-foreground py-4">
                    Nota
                  </TableHead>
                  <TableHead className="font-semibold text-foreground py-4">
                    Comentario
                  </TableHead>
                  <TableHead className="font-semibold text-foreground py-4">
                    Data
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Star className="h-8 w-8 text-muted-foreground" />
                        <p>
                          {loading
                            ? "Carregando avaliacoes..."
                            : "Nenhuma avaliacao encontrada"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map((review) => (
                    <TableRow key={review.id} className="hover:bg-muted/30">
                      <TableCell className="py-4">
                        <Badge variant="outline" className="font-mono">
                          #{review.attributes.order_id}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 font-medium">
                        {review.attributes.customer_name || "Cliente"}
                      </TableCell>
                      <TableCell className="py-4">
                        <StarRating
                          rating={review.attributes.rating}
                          size={16}
                        />
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground max-w-xs truncate">
                        {review.attributes.comment || (
                          <span className="italic">Sem comentario</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(review.attributes.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredReviews.length > 0 && (
            <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
              <div>
                Mostrando {filteredReviews.length} de {reviews.length}{" "}
                avaliacoes
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
