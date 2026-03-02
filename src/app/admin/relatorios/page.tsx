"use client";

import { useSearchParams, useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/catalog-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingCart, Users, Shield } from "lucide-react";
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

const CATEGORIES = [
  {
    key: "faturamento",
    label: "Faturamento",
    icon: DollarSign,
    tabs: [
      { key: "vendas-por-periodo", label: "Período" },
      { key: "faturamento-mensal", label: "Mensal" },
      { key: "ticket-medio", label: "Ticket Médio" },
      { key: "formas-de-pagamento", label: "Pagamento" },
      { key: "descontos", label: "Descontos" },
      { key: "lucratividade", label: "Lucratividade" },
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
};

function findCategory(tab: string) {
  return CATEGORIES.find((cat) => cat.tabs.some((t) => t.key === tab));
}

export default function RelatoriosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get("tab") || "vendas-por-periodo";
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
    <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
      <AdminHeader
        title="RELATÓRIOS"
        description="Acompanhe o faturamento e as métricas da sua loja"
        className="mb-4"
      />

      <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
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
