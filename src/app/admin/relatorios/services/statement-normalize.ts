import type { StatementPaymentGroup, StatementResponse } from "./reports-service";

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0);

/**
 * Garante o formato do extrato mesmo com API desatualizada (deploy do front antes do back):
 * campos ausentes viram listas vazias e, sem `payment_groups`, monta um bloco "Todos" a partir de `items`.
 * Nunca lança — a tela não pode cair por causa de resposta incompleta.
 */
export function normalizeStatement(raw: Partial<StatementResponse> | null | undefined): StatementResponse {
  const r = raw ?? {};
  const summary = { order_count: 0, item_revenue: 0, delivery_fees: 0, total_revenue: 0, total_item_quantity: 0, ...(r.summary ?? {}) };
  const items = Array.isArray(r.items) ? r.items : [];
  let groups: StatementPaymentGroup[];
  if (Array.isArray(r.payment_groups)) {
    groups = r.payment_groups.map((g) => ({
      ...g,
      items: Array.isArray(g.items) ? g.items : [],
      delivery_fee_items: Array.isArray(g.delivery_fee_items) ? g.delivery_fee_items : [],
      order_count: num(g.order_count), items_total: num(g.items_total), delivery_fees: num(g.delivery_fees),
      total_revenue: num(g.total_revenue), average_ticket: num(g.average_ticket),
    }));
  } else {
    groups = [{
      method: "all", label: "Todos", order_count: num(summary.order_count),
      items: items.map((i) => ({ name: i.name, quantity: num(i.quantity), unit: i.unit, unit_price: num(i.unit_price) || (num(i.quantity) ? num(i.revenue) / num(i.quantity) : 0), revenue: num(i.revenue) })),
      items_total: num(summary.item_revenue), delivery_fees: num(summary.delivery_fees), delivery_fee_items: [],
      total_revenue: num(summary.total_revenue), average_ticket: num(summary.order_count) ? num(summary.total_revenue) / num(summary.order_count) : 0,
    }];
  }
  return {
    items, summary,
    period: { start_time: "00:00", end_time: "23:59", full_day: true, payment_method: "all", ...(r.period ?? {}) },
    payment_methods: Array.isArray(r.payment_methods) ? r.payment_methods : [],
    payment_groups: groups,
  };
}
