"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, TrendingUp, Eye } from "lucide-react";
import { MonthlyCharge } from "../services/billingService";

interface BillingCardProps {
  charge: MonthlyCharge;
  onViewPayment: (charge: MonthlyCharge) => void;
}

export default function BillingCard({ charge, onViewPayment }: BillingCardProps) {
  const { attributes } = charge;
  const chargeAmount = parseFloat(attributes.charge_amount);
  const monthlyRevenue = parseFloat(attributes.monthly_revenue);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "overdue":
        return "destructive";
      case "pending":
        return "secondary";
      case "cancelled":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-50 border-green-200";
      case "overdue":
        return "bg-red-50 border-red-200";
      case "pending":
        return "bg-amber-50 border-amber-200";
      default:
        return "";
    }
  };

  return (
    <Card className={`${getStatusColor(attributes.status)}`}>
      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Info principal */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-background">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{attributes.reference_period}</h3>
                <Badge variant={getStatusVariant(attributes.status)}>
                  {attributes.status_description}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {attributes.tier_description}
              </p>
            </div>
          </div>

          {/* Valores */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-6">
              {/* Faturamento */}
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Faturamento</p>
                  <p className="font-medium">{formatCurrency(monthlyRevenue)}</p>
                </div>
              </div>

              {/* Valor da cobrança */}
              <div>
                <p className="text-xs text-muted-foreground">Mensalidade</p>
                <p className="font-bold text-lg">
                  {chargeAmount > 0 ? formatCurrency(chargeAmount) : "Grátis"}
                </p>
              </div>

              {/* Vencimento */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {attributes.status === "paid" ? "Pago em" : "Vencimento"}
                  </p>
                  <p
                    className={`font-medium ${
                      attributes.is_overdue && attributes.status !== "paid"
                        ? "text-red-500"
                        : ""
                    }`}
                  >
                    {attributes.status === "paid" && attributes.paid_at
                      ? formatDate(attributes.paid_at)
                      : formatDate(attributes.due_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Botão */}
            <Button
              variant={attributes.status === "paid" ? "outline" : "default"}
              size="sm"
              onClick={() => onViewPayment(charge)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {attributes.status === "paid" ? "Ver detalhes" : "Pagar"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
