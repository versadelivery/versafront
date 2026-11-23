export const isWeightItem = (item: { item_type?: string | null }) =>
  item.item_type === 'weight_per_kg' || item.item_type === 'weight_per_g';

export const formatWeight = (weight: number) =>
  weight.toLocaleString('pt-BR', { maximumFractionDigits: 3 });

type QuantityItem = {
  item_type?: string | null;
  weight?: number | string | null;
  quantity?: number | string | null;
  // O peso da linha já é o de todas as unidades (etiqueta da balança); senão é por unidade e multiplica pela quantidade
  weight_total?: boolean | null;
};

// Peso de todas as unidades da linha (o que a etiqueta mostra)
export const orderItemTotalWeight = (item: QuantityItem) => {
  const weight = Number(item.weight) || 0;
  return item.weight_total ? weight : weight * (Number(item.quantity) || 1);
};

const weightUnit = (item: QuantityItem) => (item.item_type === 'weight_per_g' ? 'g' : 'kg');

// "2,2 kg" para itens vendidos por peso, "2 un. · 2,406 kg" (peso total) ou "2x 1,203 kg" (peso por unidade) com mais de uma unidade, "3x" para os demais
export const orderItemQuantityLabel = (item: QuantityItem) => {
  if (isWeightItem(item) && item.weight != null) {
    const quantity = Number(item.quantity);
    const weight = `${formatWeight(Number(item.weight))} ${weightUnit(item)}`;
    if (quantity <= 1) return weight;
    return item.weight_total ? `${quantity} un. · ${weight}` : `${quantity}x ${weight}`;
  }
  return `${item.quantity}x`;
};

// "2,406 kg": peso de todas as unidades da linha
export const orderItemTotalWeightLabel = (item: QuantityItem, format: (value: number) => string = formatWeight) =>
  `${format(orderItemTotalWeight(item))} ${weightUnit(item)}`;

// Texto da via impressa/PDF: quantidade e peso total ("2 un. · 2,406 kg"). Sem peso, só a quantidade.
export const orderItemPrintLabel = (item: QuantityItem, format: (value: number) => string = formatWeight) => {
  if (!isWeightItem(item) || item.weight == null) return `${item.quantity} un.`;
  const weight = `${format(orderItemTotalWeight(item))} ${weightUnit(item)}`;
  return Number(item.quantity) > 1 ? `${item.quantity} un. · ${weight}` : weight;
};
