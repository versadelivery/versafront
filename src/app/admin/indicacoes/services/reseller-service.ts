import api from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

export interface Referral {
  id: number;
  name: string;
  approved: boolean;
  billing_delinquent: boolean;
  referred_at: string;
  last_charge_amount: number | null;
  last_charge_period: string | null;
}

export interface ReferralsResponse {
  referral_code: string;
  referral_link: string;
  referrals: Referral[];
}

export interface CommissionAttributes {
  id: number;
  reference_month: number;
  reference_year: number;
  reference_period: string;
  base_amount: string;
  amount: string;
  rate: string;
  status: "pending" | "available" | "paid" | "reversed" | "suspended";
  status_description: string;
  available_at: string;
  created_at: string;
  referred_shop: {
    id: number;
    name: string;
    billing_tier: string;
    charge_amount: string;
  };
}

export interface Commission {
  id: string;
  type: string;
  attributes: CommissionAttributes;
}

export interface CommissionSummary {
  pending_amount: number;
  available_amount: number;
  paid_amount: number;
  total_referrals: number;
  active_referrals: number;
}

export interface PayoutAttributes {
  id: number;
  total_amount: string;
  status: "pending" | "paid";
  paid_at: string | null;
  notes: string | null;
  receipt_url: string | null;
  pix_key: string | null;
  document: string | null;
  commissions_count: number;
  created_at: string;
}

export interface Payout {
  id: string;
  type: string;
  attributes: PayoutAttributes;
}

export interface ResellerConfig {
  id: number;
  pix_key: string | null;
  pix_key_type: string | null;
  document: string | null;
  bank_name: string | null;
  bank_agency: string | null;
  bank_account: string | null;
}

export async function getReferrals(): Promise<ReferralsResponse> {
  const response = await api.get(API_ENDPOINTS.RESELLER.REFERRALS);
  return response.data;
}

export async function getCommissions(params?: {
  status?: string;
  year?: number;
  month?: number;
}): Promise<{ data: Commission[] }> {
  const response = await api.get(API_ENDPOINTS.RESELLER.COMMISSIONS, { params });
  return response.data;
}

export async function getCommissionSummary(): Promise<CommissionSummary> {
  const response = await api.get(API_ENDPOINTS.RESELLER.COMMISSIONS_SUMMARY);
  return response.data;
}

export async function getPayouts(): Promise<{ data: Payout[] }> {
  const response = await api.get(API_ENDPOINTS.RESELLER.PAYOUTS);
  return response.data;
}

export async function getResellerConfig(): Promise<{ data: { attributes: ResellerConfig } }> {
  const response = await api.get(API_ENDPOINTS.RESELLER.CONFIG);
  return response.data;
}

export async function updateResellerConfig(data: Partial<ResellerConfig>): Promise<{ data: { attributes: ResellerConfig } }> {
  const response = await api.put(API_ENDPOINTS.RESELLER.CONFIG, { shop_reseller_config: data });
  return response.data;
}
