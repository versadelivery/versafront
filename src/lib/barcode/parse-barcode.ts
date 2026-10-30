export type ScaleMode = 'weight' | 'total'

export interface ScanItem {
  id: string
  barcode: string | null
  scaleCode: number | null
  itemType: 'unit' | 'weight_per_kg' | 'weight_per_g'
  // Preço efetivo: o com desconto quando existir (igual ao cálculo do servidor).
  price: number
  active: boolean
}

export type ScanError =
  | 'not_found'
  | 'invalid_check_digit'
  | 'unknown_scale_code'
  | 'zero_weight'
  | 'inactive'
  | 'invalid_price'

export type ScanResult<T extends ScanItem> =
  | { kind: 'unit'; item: T }
  | { kind: 'needs_weight'; item: T }
  | { kind: 'scale'; item: T; weight: number; total: number }
  | { kind: 'error'; reason: ScanError }

const SCALE_LABEL = /^2\d{12}$/

const round = (value: number, places: number) => {
  const factor = 10 ** places
  return Math.round((value + Number.EPSILON) * factor) / factor
}

const fail = (reason: ScanError): { kind: 'error'; reason: ScanError } => ({ kind: 'error', reason })

// Texto digitado na busca só vira leitura de código com 8+ dígitos e nenhuma letra.
export function isScannable(text: string): boolean {
  return /^\d{8,}$/.test(text.trim())
}

export function isValidEan13(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false

  const sum = [...code.slice(0, 12)].reduce((acc, digit, i) => acc + Number(digit) * (i % 2 === 0 ? 1 : 3), 0)
  return (10 - (sum % 10)) % 10 === Number(code[12])
}

function parseScaleLabel<T extends ScanItem>(code: string, mode: ScaleMode, items: T[]): ScanResult<T> {
  if (!isValidEan13(code)) return fail('invalid_check_digit')

  const scaleCode = Number(code.slice(1, 7))
  const item = items.find((candidate) => candidate.itemType !== 'unit' && candidate.scaleCode === scaleCode)
  if (!item) return fail('unknown_scale_code')
  if (!item.active) return fail('inactive')

  const payload = Number(code.slice(7, 12))
  if (payload === 0) return fail('zero_weight')
  if (!(item.price > 0)) return fail('invalid_price')

  if (mode === 'total') {
    const total = payload / 100
    const weight = round(total / item.price, 3)
    return weight > 0 ? { kind: 'scale', item, weight, total } : fail('zero_weight')
  }

  // A balança grava gramas; item por kg guarda kg e item por grama guarda gramas.
  const weight = item.itemType === 'weight_per_kg' ? payload / 1000 : payload
  return { kind: 'scale', item, weight, total: round(item.price * weight, 2) }
}

// Ordem de resolução: código de fábrica exato, depois etiqueta de balança (13 dígitos começando com 2).
export function parseBarcode<T extends ScanItem>(text: string, mode: ScaleMode, items: T[]): ScanResult<T> {
  const code = text.trim()
  if (!/^\d+$/.test(code)) return fail('not_found')

  const factoryItem = items.find((candidate) => candidate.barcode === code)
  if (factoryItem) {
    if (!factoryItem.active) return fail('inactive')
    return { kind: factoryItem.itemType === 'unit' ? 'unit' : 'needs_weight', item: factoryItem }
  }

  if (SCALE_LABEL.test(code)) return parseScaleLabel(code, mode, items)

  return fail('not_found')
}
