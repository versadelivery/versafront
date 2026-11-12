// Agendamento de pedidos: tipos e funções puras. Os horários vêm prontos da API (GET /scheduling/slots, já no
// fuso de Brasília, com offset -03:00); aqui só se agrupa e se formata, sem recalcular regra de funcionamento.

export type SchedulingMode = "disabled" | "delivery_and_pickup" | "delivery_only" | "pickup_only"

export const SCHEDULING_MODE_OPTIONS: { value: SchedulingMode; label: string; description: string }[] = [
  { value: "disabled", label: "Não permitir", description: "Clientes e PDV não podem agendar pedidos." },
  { value: "delivery_and_pickup", label: "Delivery e retirada", description: "Aceita agendamento dos dois tipos de pedido." },
  { value: "delivery_only", label: "Só delivery", description: "Agendamento apenas para entrega." },
  { value: "pickup_only", label: "Só retirada", description: "Agendamento apenas para retirada na loja." },
]

export interface SchedulingDay {
  date: string // "2026-11-13"
  slots: string[] // ["2026-11-13T12:00:00-03:00", ...]
}

export interface SchedulingSlots {
  mode: SchedulingMode
  allowed: boolean
  timezone: string
  min_lead_minutes: number
  max_days: number
  slot_minutes: number
  days: SchedulingDay[]
  popular_dates: { date: string; count: number }[]
}

const WEEKDAYS_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]
const WEEKDAYS_LONG = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"]

// "2026-11-13" -> Date ao meio-dia local (o meio-dia evita virar o dia por fuso/horário de verão)
function parseDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

const dd = (value: number) => String(value).padStart(2, "0")

/** "13/11" */
export function formatDayMonth(date: string): string {
  const [, month, day] = date.split("-")
  return `${day}/${month}`
}

/** "12:00" a partir do ISO da API (o texto já está no horário da loja; não passa por Date para não depender do fuso do navegador) */
export function formatSlotTime(iso: string): string {
  return iso.slice(11, 16)
}

/** "Hoje", "Amanhã" ou "sex, 13/11". `today` é a data de hoje da loja ("2026-11-12"). */
export function formatDayLabel(date: string, today: string): string {
  if (date === today) return "Hoje"
  if (date === addDays(today, 1)) return "Amanhã"
  return `${WEEKDAYS_SHORT[parseDate(date).getDay()]}, ${formatDayMonth(date)}`
}

/** "sexta-feira, 13/11 às 12:00" */
export function describeSchedule(iso: string): string {
  const date = iso.slice(0, 10)
  return `${WEEKDAYS_LONG[parseDate(date).getDay()]}, ${formatDayMonth(date)} às ${formatSlotTime(iso)}`
}

export function addDays(date: string, amount: number): string {
  const next = parseDate(date)
  next.setDate(next.getDate() + amount)
  return `${next.getFullYear()}-${dd(next.getMonth() + 1)}-${dd(next.getDate())}`
}

/** A data de hoje na loja, tirada do primeiro horário oferecido não serve (pode ser amanhã): usa o relógio de Brasília. */
export function todayInShopZone(now: Date = new Date(), timeZone = "America/Sao_Paulo"): string {
  // en-CA formata como AAAA-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now)
}

/**
 * Atalhos de dia: os mais agendados primeiro (lojista/PDV) e depois os próximos dias com horário, até `limit`.
 * Só entram dias que têm horário disponível.
 */
export function pickDayChips(days: SchedulingDay[], popular: { date: string }[] = [], limit = 5): SchedulingDay[] {
  const byDate = new Map(days.map((day) => [day.date, day]))
  const chosen: SchedulingDay[] = []
  const seen = new Set<string>()

  for (const entry of popular) {
    const day = byDate.get(entry.date)
    if (day && !seen.has(day.date)) {
      chosen.push(day)
      seen.add(day.date)
    }
  }
  for (const day of days) {
    if (chosen.length >= limit) break
    if (!seen.has(day.date)) {
      chosen.push(day)
      seen.add(day.date)
    }
  }
  return chosen.slice(0, limit)
}

/** O horário escolhido ainda existe na lista atual? (a loja pode ter mudado o horário, ou ele passou) */
export function isSlotAvailable(days: SchedulingDay[], iso: string | null): boolean {
  if (!iso) return false
  return days.some((day) => day.slots.includes(iso))
}

/** Data (AAAA-MM-DD) e hora (HH:MM) de qualquer ISO no relógio de Brasília, venha com -03:00 ou em UTC. */
export function inShopZone(iso: string, timeZone = "America/Sao_Paulo"): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00"
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` }
}

export const SCHEDULE_PRICE_NOTICE =
  "O pagamento é feito no dia da entrega e vale o preço do dia: o valor total pode mudar até lá."
