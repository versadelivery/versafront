import type { ScanItem } from './parse-barcode.ts'

export interface CatalogItemLike {
  id: string | number
  attributes: {
    item_type: ScanItem['itemType']
    price?: string | number | null
    price_with_discount?: string | number | null
    active?: boolean
    barcode?: string | null
    scale_code?: number | null
  }
}

const toNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

// Converte o item do catálogo (payload de admin) no formato do parser, guardando o item original em `raw`.
export function toScanItem<R extends CatalogItemLike>(raw: R, groupActive = true): ScanItem & { raw: R } {
  const { attributes } = raw
  const discount = attributes.price_with_discount
  const hasDiscount = discount !== null && discount !== undefined && discount !== ''

  return {
    id: String(raw.id),
    barcode: attributes.barcode || null,
    scaleCode: attributes.scale_code ?? null,
    itemType: attributes.item_type,
    price: toNumber(hasDiscount ? discount : attributes.price),
    active: groupActive && attributes.active !== false,
    raw,
  }
}
