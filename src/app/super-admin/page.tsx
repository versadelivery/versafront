"use client";

import { useEffect, useState } from "react";
import {
  Store,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { API_BASE_URL } from "@/api/routes";
import { getSuperAdminToken } from "@/lib/auth";
import { toast } from "sonner";
import Link from "next/link";

interface DashboardData {
  shops: {
    total: number;
    pending_approval: number;
    approved: number;
    delinquent: number;
    active_billing: number;
    new_this_month: number;
    by_category: Record<string, number>;
  };
  billing: {
    current_month: {
      period: string;
      pending_count: number;
      pending_amount: number;
      paid_count: number;
      paid_amount: number;
      overdue_count: number;
      overdue_amount: number;
      cancelled_count: number;
      mrr: number;
    };
    total_unpaid_amount: number;
    total_paid_amount: number;
    mrr_evolution: { period: string; amount: number }[];
    by_tier: Record<string, number>;
  };
  orders: {
    today_count: number;
    this_month_count: number;
    this_month_gmv: number;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  other: "Outros",
  hamburgueria: "Hamburgueria",
  pizzaria: "Pizzaria",
  acaiteria: "Açaíteria",
  padaria: "Padaria",
  confeitaria: "Confeitaria",
  restaurante: "Restaurante",
  lanchonete: "Lanchonete",
  sorveteria: "Sorveteria",
  cafeteria: "Cafeteria",
  bar: "Bar",
  doceria: "Doceria",
  sushi: "Sushi",
  churrascaria: "Churrascaria",
  pastelaria: "Pastelaria",
  marmitaria: "Marmitaria",
  petiscaria: "Petiscaria",
  emporio: "Empório",
  mercado: "Mercado",
  conveniencia: "Conveniência",
};

const TIER_LABELS: Record<string, string> = {
  free: "Grátis (< R$800)",
  tier_39: "R$39/mês",
  tier_79: "R$79/mês",
  tier_129: "R$129/mês",
  tier_199: "R$199/mês",
  tier_279: "R$279/mês",
  tier_349: "R$349/mês",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function KpiCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor = "text-[#1B1B1B]",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="font-body text-sm text-[#858585]">{label}</p>
        <p className={`font-display text-2xl font-bold truncate ${valueColor}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E8E4DF] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#0B996E]" />
          <h2 className="font-display text-base font-semibold text-[#1B1B1B]">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function MrrTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DF] shadow-lg p-3">
      <p className="font-body text-sm text-[#858585]">{label}</p>
      <p className="font-display text-base font-bold text-[#0B996E]">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const token = getSuperAdminToken();
      const response = await fetch(`${API_BASE_URL}/super_admins/dashboard`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error();
      setData(await response.json());
    } catch {
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#0B996E]" />
      </div>
    );
  }

  if (!data) return null;

  const { shops, billing, orders } = data;
  const cm = billing.current_month;

  const topCategories = Object.entries(shops.by_category)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0)
    .slice(0, 8);

  const tierEntries = Object.entries(billing.by_tier).filter(
    ([, count]) => count > 0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#1B1B1B]">
              Dashboard
            </h1>
            <p className="font-body text-sm text-[#858585] mt-1">
              Visão geral da plataforma
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-full border border-[#E8E4DF] bg-white px-4 py-2 font-body text-sm font-medium text-[#474747] hover:bg-[#F9FFF6] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>

        {/* Alerta de aprovação pendente */}
        {shops.pending_approval > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="font-body text-sm text-amber-800">
                <span className="font-semibold">
                  {shops.pending_approval}{" "}
                  {shops.pending_approval === 1
                    ? "loja aguarda"
                    : "lojas aguardam"}
                </span>{" "}
                aprovação
              </p>
            </div>
            <Link
              href="/super-admin/merchants"
              className="font-body text-sm font-semibold text-amber-700 hover:text-amber-900 hover:underline transition-colors"
            >
              Revisar agora
            </Link>
          </div>
        )}

        {/* KPIs — Lojas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total de lojas"
            value={shops.total}
            icon={Store}
            iconBg="bg-[#F9FFF6]"
            iconColor="text-[#0B996E]"
          />
          <KpiCard
            label="Aguardando aprovação"
            value={shops.pending_approval}
            icon={Clock}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            valueColor={
              shops.pending_approval > 0 ? "text-amber-600" : "text-[#1B1B1B]"
            }
          />
          <KpiCard
            label="Inadimplentes"
            value={shops.delinquent}
            icon={AlertTriangle}
            iconBg="bg-red-50"
            iconColor="text-[#B22557]"
            valueColor={
              shops.delinquent > 0 ? "text-[#B22557]" : "text-[#1B1B1B]"
            }
          />
          <KpiCard
            label="Ativas (billing)"
            value={shops.active_billing}
            icon={CheckCircle2}
            iconBg="bg-[#F9FFF6]"
            iconColor="text-[#0B996E]"
            valueColor="text-[#0B996E]"
          />
        </div>

        {/* KPIs — Financeiro e Pedidos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label={`MRR — ${cm.period}`}
            value={formatCurrency(cm.mrr)}
            icon={TrendingUp}
            iconBg="bg-[#F9FFF6]"
            iconColor="text-[#0B996E]"
            valueColor="text-[#0B996E]"
          />
          <KpiCard
            label="A receber (total)"
            value={formatCurrency(billing.total_unpaid_amount)}
            icon={DollarSign}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            valueColor={
              billing.total_unpaid_amount > 0
                ? "text-amber-600"
                : "text-[#1B1B1B]"
            }
          />
          <KpiCard
            label="Pedidos hoje"
            value={orders.today_count}
            icon={ShoppingBag}
            iconBg="bg-[#F9FFF6]"
            iconColor="text-[#0B996E]"
          />
          <KpiCard
            label="GMV do mês"
            value={formatCurrency(orders.this_month_gmv)}
            icon={BarChart3}
            iconBg="bg-[#F9FFF6]"
            iconColor="text-[#0B996E]"
          />
        </div>

        {/* MRR Chart + Breakdown do mês */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Section title="Evolução do MRR — últimos 6 meses" icon={TrendingUp}>
              {billing.mrr_evolution.every((m) => m.amount === 0) ? (
                <div className="h-[220px] flex items-center justify-center">
                  <p className="font-body text-sm text-[#858585]">
                    Sem dados de faturamento ainda
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={billing.mrr_evolution}
                    margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DF" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12, fill: "#858585", fontFamily: "Inter" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#858585", fontFamily: "Inter" }}
                      tickFormatter={(v) =>
                        new Intl.NumberFormat("pt-BR", {
                          notation: "compact",
                          style: "currency",
                          currency: "BRL",
                        }).format(v)
                      }
                    />
                    <Tooltip content={<MrrTooltip />} />
                    <Bar dataKey="amount" fill="#0B996E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Section>
          </div>

          <Section title={`Cobranças — ${cm.period}`} icon={DollarSign}>
            <div className="divide-y divide-[#E8E4DF]">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0B996E]" />
                  <span className="font-body text-sm text-[#474747]">Pagas</span>
                  <span className="font-body text-xs text-[#858585]">
                    ({cm.paid_count})
                  </span>
                </div>
                <span className="font-body text-sm font-semibold text-[#0B996E]">
                  {formatCurrency(cm.paid_amount)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-body text-sm text-[#474747]">Pendentes</span>
                  <span className="font-body text-xs text-[#858585]">
                    ({cm.pending_count})
                  </span>
                </div>
                <span className="font-body text-sm font-semibold text-amber-600">
                  {formatCurrency(cm.pending_amount)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#B22557]" />
                  <span className="font-body text-sm text-[#474747]">Vencidas</span>
                  <span className="font-body text-xs text-[#858585]">
                    ({cm.overdue_count})
                  </span>
                </div>
                <span className="font-body text-sm font-semibold text-[#B22557]">
                  {formatCurrency(cm.overdue_amount)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#858585]" />
                  <span className="font-body text-sm text-[#474747]">Canceladas</span>
                  <span className="font-body text-xs text-[#858585]">
                    ({cm.cancelled_count})
                  </span>
                </div>
                <span className="font-body text-sm font-semibold text-[#858585]">
                  —
                </span>
              </div>
            </div>
          </Section>
        </div>

        {/* Lojas por categoria + Tiers + Pedidos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Section
            title="Lojas por categoria"
            icon={Store}
            action={
              <Link
                href="/super-admin/merchants"
                className="font-body text-xs text-[#0B996E] hover:underline"
              >
                Ver todas
              </Link>
            }
          >
            {topCategories.length === 0 ? (
              <p className="font-body text-sm text-[#858585]">
                Nenhuma loja cadastrada
              </p>
            ) : (
              <div className="divide-y divide-[#E8E4DF]">
                {topCategories.map(([key, count]) => (
                  <div key={key} className="flex items-center justify-between py-2.5">
                    <span className="font-body text-sm text-[#474747]">
                      {CATEGORY_LABELS[key] ?? key}
                    </span>
                    <span className="font-body text-sm font-semibold text-[#1B1B1B]">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Distribuição por tier" icon={DollarSign}>
            {tierEntries.length === 0 ? (
              <p className="font-body text-sm text-[#858585]">
                Sem cobranças no mês atual
              </p>
            ) : (
              <div className="divide-y divide-[#E8E4DF]">
                {tierEntries.map(([tier, count]) => (
                  <div key={tier} className="flex items-center justify-between py-2.5">
                    <span className="font-body text-sm text-[#474747]">
                      {TIER_LABELS[tier] ?? tier}
                    </span>
                    <span className="font-body text-sm font-semibold text-[#1B1B1B]">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Pedidos" icon={ShoppingBag}>
            <div className="divide-y divide-[#E8E4DF]">
              <div className="flex items-start justify-between py-3">
                <span className="font-body text-sm text-[#858585]">Hoje</span>
                <span className="font-body text-sm font-semibold text-[#1B1B1B]">
                  {orders.today_count}
                </span>
              </div>
              <div className="flex items-start justify-between py-3">
                <span className="font-body text-sm text-[#858585]">Este mês</span>
                <span className="font-body text-sm font-semibold text-[#1B1B1B]">
                  {orders.this_month_count}
                </span>
              </div>
              <div className="flex items-start justify-between py-3">
                <span className="font-body text-sm text-[#858585]">GMV do mês</span>
                <span className="font-body text-sm font-semibold text-[#0B996E]">
                  {formatCurrency(orders.this_month_gmv)}
                </span>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
