"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { ReferralLinkCard } from "./components/referral-link-card";
import { CommissionSummaryCards } from "./components/commission-summary-cards";
import { ReferralsTable } from "./components/referrals-table";
import { CommissionsTable } from "./components/commissions-table";
import { ResellerConfigForm } from "./components/reseller-config-form";
import { useReferrals, useCommissionSummary } from "./hooks/useReseller";
import { PayoutsTable } from "./components/payouts-table";

export default function IndicacoesPage() {
  const { data: referralsData, isLoading, error } = useReferrals();
  const { data: summary, isLoading: summaryLoading } = useCommissionSummary();

  if (isLoading || summaryLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <p className="text-red-500">Erro ao carregar dados de indicações</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 h-16">
            <Link href="/admin" className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:block">Voltar</span>
            </Link>
            <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
            <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">Programa de Indicações</h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <p className="text-sm text-muted-foreground">
          Indique outros lojistas e ganhe 12% de comissão sobre as mensalidades pagas.
        </p>

        {referralsData && (
          <ReferralLinkCard
            referralCode={referralsData.referral_code}
            referralLink={referralsData.referral_link}
          />
        )}

        {summary && <CommissionSummaryCards summary={summary} />}

        <Tabs defaultValue="indicados">
          <TabsList>
            <TabsTrigger value="indicados">Lojas indicadas</TabsTrigger>
            <TabsTrigger value="comissoes">Comissões</TabsTrigger>
            <TabsTrigger value="repasses">Repasses</TabsTrigger>
            <TabsTrigger value="dados">Dados de recebimento</TabsTrigger>
          </TabsList>

          <TabsContent value="indicados" className="mt-4 bg-white rounded-lg border border-[#E5E2DD] p-4">
            <ReferralsTable referrals={referralsData?.referrals ?? []} />
          </TabsContent>

          <TabsContent value="comissoes" className="mt-4 bg-white rounded-lg border border-[#E5E2DD] p-4">
            <CommissionsTable />
          </TabsContent>

          <TabsContent value="repasses" className="mt-4 bg-white rounded-lg border border-[#E5E2DD] p-4">
            <PayoutsTable />
          </TabsContent>

          <TabsContent value="dados" className="mt-4 bg-white rounded-lg border border-[#E5E2DD] p-4">
            <ResellerConfigForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
