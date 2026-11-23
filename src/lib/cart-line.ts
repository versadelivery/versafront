// Duas adições ao carrinho só viram a mesma linha (quantidade +1) se tudo que o cliente escolheu for igual:
// peso, adicionais, MODO DE PREPARO, montagem e complementos. Faltando algum, o item com preparo era
// engolido por uma linha igual sem preparo, e o pedido saía sem o modo de preparo.
export interface CartLineChoices {
  id?: string | number
  weight?: number
  selectedExtras?: string[]
  selectedMethods?: string[]
  selectedOptions?: Record<string, string>
  selectedSharedComplements?: string[]
}

// Sem escolha (undefined) é igual a lista vazia, e a ordem em que o cliente marcou não importa
const sameList = (a?: string[], b?: string[]) => {
  const left = [...(a ?? [])].map(String).sort()
  const right = [...(b ?? [])].map(String).sort()
  return left.length === right.length && left.every((value, index) => value === right[index])
}

const sameOptions = (a?: Record<string, string>, b?: Record<string, string>) => {
  const left = a ?? {}
  const right = b ?? {}
  const keys = Object.keys(left)
  return keys.length === Object.keys(right).length && keys.every((key) => left[key] === right[key])
}

export const isSameCartLine = (a: CartLineChoices, b: CartLineChoices) =>
  a.id === b.id &&
  a.weight === b.weight &&
  sameList(a.selectedExtras, b.selectedExtras) &&
  sameList(a.selectedMethods, b.selectedMethods) &&
  sameOptions(a.selectedOptions, b.selectedOptions) &&
  sameList(a.selectedSharedComplements, b.selectedSharedComplements)
