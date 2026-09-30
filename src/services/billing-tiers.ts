import api from "@/api/config";

export interface BillingTier {
  key: string;
  name: string;
  min_revenue: number;
  max_revenue: number | null;
  amount: number;
  color: string;
  position: number;
}

export const DEFAULT_BILLING_TIERS: BillingTier[] = [
  { key: "free", name: "Verde", min_revenue: 0, max_revenue: 799.99, amount: 0, color: "#16A34A", position: 0 },
  { key: "tier_29", name: "Amarelo", min_revenue: 800, max_revenue: 2999.99, amount: 39, color: "#CA8A04", position: 1 },
  { key: "tier_59", name: "Azul", min_revenue: 3000, max_revenue: 7999.99, amount: 69, color: "#2563EB", position: 2 },
  { key: "tier_99", name: "Branco", min_revenue: 8000, max_revenue: 19999.99, amount: 129, color: "#9CA3AF", position: 3 },
  { key: "tier_149", name: "Prata", min_revenue: 20000, max_revenue: 49999.99, amount: 179, color: "#6B7280", position: 4 },
  { key: "tier_219", name: "Ouro", min_revenue: 50000, max_revenue: 119999.99, amount: 229, color: "#B7791F", position: 5 },
  { key: "tier_299", name: "Black", min_revenue: 120000, max_revenue: null, amount: 299, color: "#171717", position: 6 },
];

export const formatTierRevenue = (tier: BillingTier) => {
  const currency = (value: number) => value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (tier.max_revenue === null) return `A partir de R$ ${currency(tier.min_revenue)}`;
  if (tier.min_revenue === 0) return `Até R$ ${currency(tier.max_revenue)}`;
  return `R$ ${currency(tier.min_revenue)} a R$ ${currency(tier.max_revenue)}`;
};

export const formatTierAmount = (amount: number) => amount === 0 ? "Grátis" : `R$ ${amount.toLocaleString("pt-BR")}/mês`;

export async function getBillingTiers() {
  const response = await api.get<{ tiers: BillingTier[] }>("/billing_tiers");
  return response.data.tiers;
}
