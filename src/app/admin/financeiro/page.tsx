"use client";

import { useState } from "react";
import AdminHeader from "@/components/admin/catalog-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useBilling } from "./hooks/useBilling";
import BillingCard from "./components/billing-card";
import PaymentModal from "./components/payment-modal";
import { MonthlyCharge } from "./services/billingService";

export default function FinanceiroPage() {
  const { charges, summary, currentCharge, pendingCharges, loading, error, refetch } =
    useBilling();
  const [selectedCharge, setSelectedCharge] = useState<MonthlyCharge | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleViewPayment = (charge: MonthlyCharge) => {
    setSelectedCharge(charge);
    setIsPaymentModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
      <AdminHeader
        title="FINANCEIRO"
        description="Gerencie suas mensalidades e pagamentos"
        className="mb-4"
      />

      <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
        {/* Alerta de inadimplência */}
        {summary?.is_delinquent && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-tomato font-semibold text-red-700">
                    Sua loja está bloqueada por inadimplência
                  </h3>
                  <p className="text-sm text-red-600 mt-1">
                    Você possui cobranças vencidas. Regularize sua situação para
                    voltar a receber pedidos.
                  </p>
                  {summary.delinquent_since && (
                    <p className="text-xs text-red-500 mt-2">
                      Bloqueada desde:{" "}
                      {new Date(summary.delinquent_since).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Cobranças</p>
                  <p className="text-2xl font-bold">{summary?.total_charges || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {summary?.pending_charges || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vencidas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {summary?.overdue_charges || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pendente</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(summary?.total_pending_amount || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cobrança atual */}
        {currentCharge && (
          <Card>
            <CardHeader>
              <CardTitle className="font-tomato flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Cobrança Atual
                <Badge
                  variant={
                    currentCharge.attributes.status === "paid"
                      ? "default"
                      : currentCharge.attributes.status === "overdue"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {currentCharge.attributes.status_description}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BillingCard charge={currentCharge} onViewPayment={handleViewPayment} />
            </CardContent>
          </Card>
        )}

        {/* Histórico de cobranças */}
        <Card>
          <CardHeader>
            <CardTitle className="font-tomato flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Histórico de Cobranças
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  Todas ({charges.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pendentes ({pendingCharges.length})
                </TabsTrigger>
                <TabsTrigger value="paid">
                  Pagas (
                  {charges.filter((c) => c.attributes.status === "paid").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {charges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mb-4" />
                    <p>Nenhuma cobrança encontrada</p>
                  </div>
                ) : (
                  charges.map((charge) => (
                    <BillingCard
                      key={charge.id}
                      charge={charge}
                      onViewPayment={handleViewPayment}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3">
                {pendingCharges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mb-4" />
                    <p>Nenhuma cobrança pendente</p>
                  </div>
                ) : (
                  pendingCharges.map((charge) => (
                    <BillingCard
                      key={charge.id}
                      charge={charge}
                      onViewPayment={handleViewPayment}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="paid" className="space-y-3">
                {charges.filter((c) => c.attributes.status === "paid").length ===
                0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mb-4" />
                    <p>Nenhuma cobrança paga</p>
                  </div>
                ) : (
                  charges
                    .filter((c) => c.attributes.status === "paid")
                    .map((charge) => (
                      <BillingCard
                        key={charge.id}
                        charge={charge}
                        onViewPayment={handleViewPayment}
                      />
                    ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Modal de pagamento */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedCharge(null);
          refetch();
        }}
        charge={selectedCharge}
      />
    </div>
  );
}
