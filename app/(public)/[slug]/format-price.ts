export const formatPrice = (price: number | null) => {
  if (price === null) return 'Preço não disponível';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};