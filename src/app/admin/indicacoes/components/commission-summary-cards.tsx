import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Wallet, CheckCircle, Store } from "lucide-react";
import { CommissionSummary } from "../services/reseller-service";

interface CommissionSummaryCardsProps {
  summary: CommissionSummary;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function CommissionSummaryCards({ summary }: CommissionSummaryCardsProps) {
  const cards = [
    {
      title: "A receber",
      value: formatCurrency(summary.available_amount),
      description: "Liberado, aguardando repasse",
      icon: Wallet,
      iconClass: "text-green-600",
      bgClass: "bg-green-50",
    },
    {
      title: "Em carência",
      value: formatCurrency(summary.pending_amount),
      description: "Dentro dos 15 dias úteis",
      icon: Clock,
      iconClass: "text-yellow-600",
      bgClass: "bg-yellow-50",
    },
    {
      title: "Total recebido",
      value: formatCurrency(summary.paid_amount),
      description: "Soma de todos os repasses",
      icon: CheckCircle,
      iconClass: "text-blue-600",
      bgClass: "bg-blue-50",
    },
    {
      title: "Lojas ativas",
      value: String(summary.active_referrals),
      description: `de ${summary.total_referrals} indicada(s)`,
      icon: Store,
      iconClass: "text-purple-600",
      bgClass: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-[#E5E2DD]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className={`p-1.5 rounded-md ${card.bgClass}`}>
                <card.icon className={`h-4 w-4 ${card.iconClass}`} />
              </span>
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
