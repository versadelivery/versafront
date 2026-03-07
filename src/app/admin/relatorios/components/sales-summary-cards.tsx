"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  DollarSign,
  Receipt,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { PeriodComparison } from "../services/reports-service";

interface SalesSummaryCardsProps {
  totalOrders: number;
  grossRevenue: number;
  averageTicket: number;
  comparison: PeriodComparison;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function VariationBadge({ value }: { value: number | null }) {
  if (value === null) return null;

  const isPositive = value > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive
    ? "text-green-600 border-green-300"
    : "text-red-600 border-red-300";

  return (
    <div className="flex items-center gap-1 mt-1">
      <Icon className={`h-3 w-3 ${isPositive ? "text-green-600" : "text-red-600"}`} />
      <Badge variant="outline" className={`text-xs ${colorClass}`}>
        {isPositive ? "+" : ""}
        {value}%
      </Badge>
    </div>
  );
}

export default function SalesSummaryCards({
  totalOrders,
  grossRevenue,
  averageTicket,
  comparison,
}: SalesSummaryCardsProps) {
  const cards = [
    {
      label: "Total de Pedidos",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      iconBg: "",
      iconColor: "text-blue-600",
      variation: comparison.orders_variation,
    },
    {
      label: "Faturamento Bruto",
      value: formatCurrency(grossRevenue),
      icon: DollarSign,
      iconBg: "",
      iconColor: "text-emerald-600",
      variation: comparison.revenue_variation,
    },
    {
      label: "Ticket Médio",
      value: formatCurrency(averageTicket),
      icon: Receipt,
      iconBg: "",
      iconColor: "text-amber-600",
      variation: comparison.ticket_variation,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
                <VariationBadge value={card.variation} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
