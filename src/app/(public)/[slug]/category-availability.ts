/* eslint-disable @typescript-eslint/no-explicit-any */
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export const todayDayKey = () => `${DAY_KEYS[new Date().getDay()]}_active`;

// Ids das categorias que não abrem hoje. Os grupos delas não aparecem na vitrine, nem valem no carrinho
// (a API também recusa o pedido: "A categoria 'X' não está disponível hoje").
export function hiddenCategoryIds(shopAttributes: any, dayKey: string = todayDayKey()): Set<string> {
  const raw = shopAttributes?.catalog_categories;
  const categories: any[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
  return new Set(
    categories.filter((category) => category.attributes?.[dayKey] === false).map((category) => String(category.id)),
  );
}
