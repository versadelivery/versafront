import api, { setTokenType } from "@/api/config";
import type { SchedulingSlots } from "@/lib/scheduling";

interface SlotsParams {
  /** id ou slug da loja (obrigatório no site público; o PDV usa a loja do login) */
  shopId?: number | string;
  /** retirada = true; omitido devolve o que a loja aceita em geral */
  withdrawal?: boolean;
  /** PDV/painel: manda o login da equipe e recebe também os dias mais agendados */
  admin?: boolean;
}

// Horários para agendar. É a mesma resposta para o site, o PDV e o app: o cliente só mostra, a API decide.
export async function getSchedulingSlots({ shopId, withdrawal, admin }: SlotsParams): Promise<SchedulingSlots> {
  setTokenType(admin ? "admin" : "client")
  const response = await api.get<{ data: SchedulingSlots }>("/scheduling/slots", {
    params: { shop_id: shopId, withdrawal: withdrawal === undefined ? undefined : String(withdrawal) },
  })
  return response.data.data
}

// Agendados: o lojista aceita (fica confirmado) ou libera antes do horário (vira pedido normal)
export async function confirmScheduledOrder(orderId: number | string) {
  setTokenType("admin")
  const response = await api.post(`/orders/${orderId}/confirm_scheduled`)
  return response.data
}

export async function releaseScheduledOrder(orderId: number | string) {
  setTokenType("admin")
  const response = await api.post(`/orders/${orderId}/release_scheduled`)
  return response.data
}
