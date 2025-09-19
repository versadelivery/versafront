import api, { setTokenType } from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

export type CashRegister = {
  id: string | number;
  opened_at: string;
  closed_at: string | null;
};

export async function listCashRegisters(): Promise<CashRegister[]> {
  setTokenType('admin');
  const response = await api.get(API_ENDPOINTS.CASH_REGISTERS);
  const json = response.data;
  if (Array.isArray(json?.data)) {
    return json.data.map((item: any) => ({
      id: item.id,
      opened_at: item.attributes?.opened_at ?? item.opened_at,
      closed_at: item.attributes?.closed_at ?? item.closed_at ?? null,
    }));
  }
  return [];
}

export async function openCashRegister(): Promise<void> {
  setTokenType('admin');
  await api.post(API_ENDPOINTS.CASH_REGISTER_OPEN);
}

export async function closeCashRegister(): Promise<void> {
  setTokenType('admin');
  await api.post(API_ENDPOINTS.CASH_REGISTER_CLOSE);
}

export async function createManualEntry(params: {
  kind: string;
  amount: number;
  description?: string;
}): Promise<void> {
  setTokenType('admin');
  await api.post(API_ENDPOINTS.CASH_REGISTER_MANUAL_ENTRY, params);
}


