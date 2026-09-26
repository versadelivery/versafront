export type AssemblyPricingMode = 'sum' | 'highest';

export function calculateAssemblyPrice(
  steps: any[] = [],
  selectedOptions: Record<string, string> = {},
  mode: AssemblyPricingMode = 'sum',
): number {
  const prices = steps.flatMap((step) => {
    const optionId = selectedOptions[step.id];
    const option = step.attributes?.options?.data?.find((candidate: any) => candidate.id === optionId);
    return option ? [Number(option.attributes?.price || 0)] : [];
  });

  if (mode === 'highest' && prices.length > 0) return Math.max(...prices) * prices.length;
  return prices.reduce((total, price) => total + price, 0);
}
