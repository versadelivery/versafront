import api from "@/api/config";

export interface MonthlyCharge {
  id: string;
  type: string;
  attributes: {
    id: number;
    reference_month: number;
    reference_year: number;
    reference_period: string;
    monthly_revenue: string;
    charge_amount: string;
    billing_tier: "free" | "tier_39" | "tier_79" | "tier_129" | "tier_199" | "tier_279" | "tier_349";
    status: "pending" | "paid" | "cancelled" | "overdue";
    status_description: string;
    tier_description: string;
    due_date: string;
    paid_at: string | null;
    is_overdue: boolean;
    days_until_due: number | null;
    asaas_invoice_url: string | null;
    asaas_pix_code: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface BillingSummary {
  total_charges: number;
  pending_charges: number;
  overdue_charges: number;
  total_pending_amount: number;
  is_delinquent: boolean;
  delinquent_since: string | null;
}

export interface ChargesResponse {
  data: MonthlyCharge[];
}

export interface ChargeResponse {
  data: MonthlyCharge;
}

export const billingService = {
  getCharges: async (): Promise<ChargesResponse> => {
    const response = await api.get("/monthly_charges");
    return response.data;
  },

  getCharge: async (id: string): Promise<ChargeResponse> => {
    const response = await api.get(`/monthly_charges/${id}`);
    return response.data;
  },

  getCurrentCharge: async (): Promise<ChargeResponse> => {
    const response = await api.get("/monthly_charges/current");
    return response.data;
  },

  getSummary: async (): Promise<BillingSummary> => {
    const response = await api.get("/monthly_charges/summary");
    return response.data;
  },
};
