// Regras do cliente no PDV: o que cada tipo de pedido exige antes de ir para os itens.

export type PdvOrderType = "delivery" | "pickup" | "counter" | "table";

export interface PdvCustomerFields {
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
}

export interface PdvKmFields {
  address: string;
  number: string;
  neighborhood: string;
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  hasQuote: boolean;
}

export interface PdvRuleContext {
  orderType: PdvOrderType | null;
  customer: PdvCustomerFields;
  isPerKm: boolean;
  isPerNeighborhood: boolean;
  selectedNeighborhoodId: string;
  km: PdvKmFields;
}

export const PDV_PHONE_REGEX = /^\(\d{2}\) \d{4,5}-\d{4}$/;

// Delivery: nome, telefone e endereço. Retirada: só telefone. Balcão: nada.
export function collectCustomerErrors(ctx: PdvRuleContext): Record<string, string> {
  const errors: Record<string, string> = {};
  const { orderType, customer, km } = ctx;

  if (!orderType) {
    errors.orderType = "Escolha Delivery, Retirada ou Balcão";
    return errors;
  }
  if (orderType === "table" || orderType === "counter") return errors;

  if (orderType === "delivery" && !customer.name.trim()) {
    errors.name = "Nome é obrigatório";
  }

  if (!customer.phone) {
    errors.phone = "Telefone é obrigatório";
  } else if (!PDV_PHONE_REGEX.test(customer.phone)) {
    errors.phone = "Telefone inválido. Use o formato (XX) XXXXX-XXXX";
  }

  if (orderType !== "delivery") return errors;

  if (ctx.isPerKm) {
    if (!km.address.trim()) errors.address = "Endereço é obrigatório";
    if (!km.number.trim()) errors.number = "Número é obrigatório";
    if (!km.neighborhood.trim()) errors.neighborhood = "Bairro é obrigatório";
    if (km.latitude === null || km.longitude === null) {
      errors.address = "Confirme a localização da entrega no mapa";
    } else if (km.error) {
      errors.address = km.error;
    } else if (!km.hasQuote) {
      errors.address = "Aguarde o cálculo da taxa de entrega";
    }
    return errors;
  }

  if (!customer.address.trim()) errors.address = "Endereço é obrigatório";
  if (ctx.isPerNeighborhood) {
    if (!ctx.selectedNeighborhoodId) errors.neighborhood = "Selecione um bairro";
  } else if (!customer.neighborhood.trim()) {
    errors.neighborhood = "Bairro é obrigatório";
  }
  return errors;
}

// Telefone digitado só com dígitos; vazio quando o tipo não usa telefone
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}
