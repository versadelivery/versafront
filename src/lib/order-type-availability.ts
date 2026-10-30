export type OrderType = 'delivery' | 'pickup'

export interface Availability {
  delivery: boolean
  pickup: boolean
}

interface AvailabilityFlags {
  accepts_delivery?: boolean | null
  accepts_pickup?: boolean | null
}

// Lojas em cache de antes dos campos existirem não trazem as flags: nesse caso tudo está ligado.
export function getAvailability(config?: AvailabilityFlags | null): Availability {
  return {
    delivery: config?.accepts_delivery ?? true,
    pickup: config?.accepts_pickup ?? true,
  }
}

// Se o tipo escolhido foi desligado, vai para o outro. Sem nenhum ligado mantém o atual: a API recusa.
export function resolveOrderType(current: OrderType, availability: Availability): OrderType {
  if (availability[current]) return current

  const other: OrderType = current === 'delivery' ? 'pickup' : 'delivery'
  return availability[other] ? other : current
}

// A API exige pelo menos um ligado; a tela usa o mesmo critério para nem oferecer o clique.
export function canTurnOff(type: OrderType, availability: Availability): boolean {
  const other: OrderType = type === 'delivery' ? 'pickup' : 'delivery'
  return availability[other]
}
