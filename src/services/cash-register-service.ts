import api, { setTokenType } from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

export type CashRegisterTransaction = {
  id: string | number;
  kind: string;
  amount: number;
  description: string;
  created_at?: string;
};

export type CashRegister = {
  id: string | number;
  opened_at: string;
  closed_at: string | null;
  transactions: CashRegisterTransaction[];
};

function parseTransaction(t: any): CashRegisterTransaction {
  return {
    id: t.id,
    kind: t.attributes?.kind ?? t.kind,
    amount: parseFloat(t.attributes?.amount ?? t.amount ?? 0),
    description: t.attributes?.description ?? t.description ?? "",
    created_at: t.attributes?.created_at ?? t.created_at,
  };
}

function parseRegister(item: any): CashRegister {
  return {
    id: item.id,
    opened_at: item.attributes?.opened_at ?? item.opened_at,
    closed_at:
      item.attributes !== undefined
        ? (item.attributes.closed_at ?? null)
        : (item.closed_at ?? null),
    transactions: Array.isArray(item.attributes?.transactions)
      ? item.attributes.transactions.map(parseTransaction)
      : [],
  };
}

export async function listCashRegisters(): Promise<CashRegister[]> {
  setTokenType("admin");
  const response = await api.get(API_ENDPOINTS.CASH_REGISTERS);
  const json = response.data;
  if (Array.isArray(json?.data)) {
    return json.data.map(parseRegister);
  }
  return [];
}

export async function openCashRegister(): Promise<void> {
  setTokenType("admin");
  await api.post(API_ENDPOINTS.CASH_REGISTER_OPEN);
}

export async function closeCashRegister(): Promise<void> {
  setTokenType("admin");
  await api.post(API_ENDPOINTS.CASH_REGISTER_CLOSE);
}

export async function createManualEntry(params: {
  kind: string;
  amount: number;
  description?: string;
}): Promise<void> {
  setTokenType("admin");
  await api.post(API_ENDPOINTS.CASH_REGISTER_MANUAL_ENTRY, params);
}
