interface StepLike {
  attributes?: { required?: boolean; options?: { data?: unknown[] } }
}

interface ItemAttributesLike {
  steps?: { data?: StepLike[] }
  // o payload do item traz muitos outros campos
  [key: string]: unknown
}

// Só etapa obrigatória (com opções para escolher) impede o item de entrar direto no carrinho ao bipar.
// Extras, modos de preparo e complementos são opcionais: o operador do balcão não deve parar neles a cada bipada.
export function needsOptions(attributes: ItemAttributesLike): boolean {
  return (attributes.steps?.data ?? []).some(
    (step) => step.attributes?.required !== false && (step.attributes?.options?.data?.length ?? 0) > 0
  )
}
