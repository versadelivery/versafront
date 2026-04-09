"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingCart, Users, Shield, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import SalesByPeriodTab from "./components/sales-by-period-tab";
import MonthlyRevenueTab from "./components/monthly-revenue-tab";
import AverageTicketTab from "./components/average-ticket-tab";
import SalesByItemTab from "./components/sales-by-item-tab";
import TopCustomersTab from "./components/top-customers-tab";
import PaymentMethodsTab from "./components/payment-methods-tab";
import SalesByHourTab from "./components/sales-by-hour-tab";
import SalesByWeekdayTab from "./components/sales-by-weekday-tab";
import SalesByNeighborhoodTab from "./components/sales-by-neighborhood-tab";
import CustomerAcquisitionTab from "./components/customer-acquisition-tab";
import SalesByChannelTab from "./components/sales-by-channel-tab";
import DiscountedOrdersTab from "./components/discounted-orders-tab";
import AveragePrepTimeTab from "./components/average-prep-time-tab";
import AverageDeliveryTimeTab from "./components/average-delivery-time-tab";
import ItemProfitabilityTab from "./components/item-profitability-tab";
import SalesByUserTab from "./components/sales-by-user-tab";
import ItemModificationsTab from "./components/item-modifications-tab";
import PaymentModificationsTab from "./components/payment-modifications-tab";
import CashRegisterStatementTab from "./components/cash-register-statement-tab";
import VisitorsTab from "./components/visitors-tab";
import DeliveryFeesTab from "./components/delivery-fees-tab";
import CouponUsageTab from "./components/coupon-usage-tab";
import WeeklySummaryTab from "./components/weekly-summary-tab";

const CATEGORIES = [
  {
    key: "faturamento",
    label: "Faturamento",
    icon: DollarSign,
    tabs: [
      { key: "resumo-semanal", label: "Resumo" },
      { key: "vendas-por-periodo", label: "Período" },
      { key: "faturamento-mensal", label: "Mensal" },
      { key: "ticket-medio", label: "Ticket Médio" },
      { key: "formas-de-pagamento", label: "Pagamento" },
      { key: "descontos", label: "Descontos" },
      { key: "lucratividade", label: "Lucratividade" },
      { key: "extrato-caixa", label: "Extrato Caixa" },
      { key: "cupons-utilizados", label: "Cupons" },
    ],
  },
  {
    key: "vendas",
    label: "Vendas",
    icon: ShoppingCart,
    tabs: [
      { key: "vendas-por-item", label: "Por Item" },
      { key: "vendas-por-horario", label: "Por Horário" },
      { key: "vendas-por-dia-semana", label: "Por Dia" },
      { key: "vendas-por-bairro", label: "Por Bairro" },
      { key: "vendas-por-canal", label: "Por Canal" },
      { key: "tempo-preparo", label: "Tempo Preparo" },
      { key: "tempo-entrega", label: "Tempo Entrega" },
      { key: "por-atendente", label: "Por Atendente" },
      { key: "visitantes", label: "Visitantes" },
      { key: "taxas-entrega", label: "Taxas Entrega" },
    ],
  },
  {
    key: "clientes",
    label: "Clientes",
    icon: Users,
    tabs: [
      { key: "top-clientes", label: "Top Clientes" },
      { key: "aquisicao-clientes", label: "Aquisição" },
    ],
  },
  {
    key: "auditoria",
    label: "Auditoria",
    icon: Shield,
    tabs: [
      { key: "itens-alterados", label: "Itens Alterados" },
      { key: "pagamento-alterado", label: "Pagamento Alterado" },
    ],
  },
] as const;

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  "resumo-semanal": WeeklySummaryTab,
  "vendas-por-periodo": SalesByPeriodTab,
  "faturamento-mensal": MonthlyRevenueTab,
  "ticket-medio": AverageTicketTab,
  "formas-de-pagamento": PaymentMethodsTab,
  "vendas-por-item": SalesByItemTab,
  "vendas-por-horario": SalesByHourTab,
  "vendas-por-dia-semana": SalesByWeekdayTab,
  "vendas-por-bairro": SalesByNeighborhoodTab,
  "top-clientes": TopCustomersTab,
  "vendas-por-canal": SalesByChannelTab,
  "aquisicao-clientes": CustomerAcquisitionTab,
  "descontos": DiscountedOrdersTab,
  "tempo-preparo": AveragePrepTimeTab,
  "tempo-entrega": AverageDeliveryTimeTab,
  "lucratividade": ItemProfitabilityTab,
  "por-atendente": SalesByUserTab,
  "itens-alterados": ItemModificationsTab,
  "pagamento-alterado": PaymentModificationsTab,
  "extrato-caixa": CashRegisterStatementTab,
  "cupons-utilizados": CouponUsageTab,
  "visitantes": VisitorsTab,
  "taxas-entrega": DeliveryFeesTab,
};

function findCategory(tab: string) {
  return CATEGORIES.find((cat) => cat.tabs.some((t) => t.key === tab));
}

export default function RelatoriosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get("tab") || "resumo-semanal";
  const activeCategory = findCategory(currentTab) || CATEGORIES[0];

  const updateParams = (cat: string, tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cat", cat);
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (catKey: string) => {
    const cat = CATEGORIES.find((c) => c.key === catKey)!;
    updateParams(cat.key, cat.tabs[0].key);
  };

  const handleTabChange = (tab: string) => {
    updateParams(activeCategory.key, tab);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/admin" className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </a>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">Relatórios</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory.key === cat.key;
            return (
              <Button
                key={cat.key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(!isActive && "text-muted-foreground")}
                onClick={() => handleCategoryChange(cat.key)}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className="w-full justify-start">
            {activeCategory.tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {activeCategory.tabs.map((tab) => {
            const Component = TAB_COMPONENTS[tab.key];
            return (
              <TabsContent key={tab.key} value={tab.key}>
                <Component />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
