"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, UtensilsCrossed, Clock, Users, DollarSign, User } from "lucide-react";
import { TableSession } from "../services/table-service";

interface TableSessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TableSession | null;
}

export default function TableSessionDetailsModal({
  isOpen,
  onClose,
  session,
}: TableSessionDetailsModalProps) {
  if (!isOpen || !session) return null;

  const attrs = session.attributes;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}min`;
    return `${mins}min`;
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      Number(value)
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Detalhes da Comanda
                </h2>
                <p className="text-sm text-muted-foreground">
                  Mesa {attrs.table_number}
                  {attrs.table_label ? ` - ${attrs.table_label}` : ""}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant="secondary"
                className={
                  attrs.status === "open"
                    ? "bg-emerald-100 text-emerald-700 border-0"
                    : "bg-gray-100 text-gray-700 border-0"
                }
              >
                {attrs.status === "open" ? "Aberta" : "Fechada"}
              </Badge>
            </div>

            {attrs.customer_name && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  Cliente
                </div>
                <span className="text-sm font-medium">{attrs.customer_name}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                Pessoas
              </div>
              <span className="text-sm font-medium">{attrs.customer_count}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Duracao
              </div>
              <span className="text-sm font-medium">{formatDuration(attrs.duration_minutes)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                Total
              </div>
              <span className="text-sm font-medium">{formatCurrency(attrs.total_amount)}</span>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Aberto em</span>
                <span>{formatDate(attrs.opened_at)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Aberto por</span>
                <span>{attrs.opened_by_name}</span>
              </div>
              {attrs.closed_at && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fechado em</span>
                    <span>{formatDate(attrs.closed_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fechado por</span>
                    <span>{attrs.closed_by_name || "-"}</span>
                  </div>
                </>
              )}
            </div>

            {attrs.notes && (
              <div className="border-t pt-4">
                <span className="text-sm text-muted-foreground">Observacoes</span>
                <p className="text-sm mt-1">{attrs.notes}</p>
              </div>
            )}

            <div className="pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full h-11"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
