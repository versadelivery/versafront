export const isWeightItem = (item: { item_type?: string | null }) =>
  item.item_type === 'weight_per_kg' || item.item_type === 'weight_per_g';

export const formatWeight = (weight: number) =>
  weight.toLocaleString('pt-BR', { maximumFractionDigits: 3 });

// "2,2 kg" para itens vendidos por peso, "3x" para os demais
export const orderItemQuantityLabel = (item: {
  item_type?: string | null;
  weight?: number | string | null;
  quantity?: number | string | null;
}) => {
  if (isWeightItem(item) && item.weight != null) {
    const weight = `${formatWeight(Number(item.weight))} ${item.item_type === 'weight_per_g' ? 'g' : 'kg'}`;
    return Number(item.quantity) > 1 ? `${item.quantity}x ${weight}` : weight;
  }
  return `${item.quantity}x`;
};
