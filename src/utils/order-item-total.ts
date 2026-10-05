import { isWeightItem } from './order-item-quantity';

type Priced = { price?: number | string | null };

export interface TotalInput {
  price: number;
  quantity?: number | null;
  weight?: number | string | null;
  item_type?: string | null;
  assembly_pricing_mode?: string | null;
  selected_extras?: Priced[];
  complements?: Priced[];
  selected_steps?: Priced[];
}

const sum = (list?: Priced[]) => (list || []).reduce((total, entry) => total + (Number(entry.price) || 0), 0);

// Mesma conta da API (OrderItems::Interactors::CalculateTotal), para a prévia do valor enquanto edita.
// A API recalcula ao salvar e continua sendo a fonte do valor final.
export function calculateItemTotal(item: TotalInput): number {
  const stepPrices = (item.selected_steps || []).map((step) => Number(step.price) || 0);
  const steps = stepPrices.length === 0
    ? 0
    : item.assembly_pricing_mode === 'highest'
      ? Math.max(...stepPrices) * stepPrices.length
      : stepPrices.reduce((total, price) => total + price, 0);

  const unit = Number(item.price) || 0;
  const options = sum(item.selected_extras) + sum(item.complements) + steps;
  const total = isWeightItem(item)
    ? unit * (Number(item.weight) || 1) + options
    : (unit + options) * (Number(item.quantity) || 1);

  return Math.round(total * 100) / 100;
}
