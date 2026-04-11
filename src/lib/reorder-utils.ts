import type { CustomerOrder, CustomerOrderItem } from "@/types/order"
import type { CatalogItem } from "@/app/(public)/[slug]/types"

export interface ReorderCartItem extends CatalogItem {
  cartId: string
  quantity: number
  weight?: number
  selectedExtras?: string[]
  selectedMethods?: string[]
  selectedOptions?: Record<string, string>
  selectedSharedComplements?: string[]
  totalPrice: number
}

export interface ValidatedOrderItem {
  orderItem: CustomerOrderItem
  catalogItem: CatalogItem | null
  isAvailable: boolean
}

export interface OrderValidation {
  validatedItems: ValidatedOrderItem[]
  allAvailable: boolean
  unavailableNames: string[]
  cartItems: ReorderCartItem[]
}

// ─── Catalog index ────────────────────────────────────────────────────────────

export function buildCatalogIndex(shopData: any): Map<string, CatalogItem> {
  const index = new Map<string, CatalogItem>()
  if (!shopData?.data?.attributes?.catalog_groups) return index

  const groups = shopData.data.attributes.catalog_groups
  const groupList: any[] = Array.isArray(groups) ? groups : (groups?.data ?? [])

  const dayKeys = [
    "sunday", "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday",
  ] as const
  const todayKey = `${dayKeys[new Date().getDay()]}_active`

  groupList.forEach((g: any) => {
    if (g.attributes?.active === false) return

    const rawItems = g.attributes?.items
    const items: any[] = Array.isArray(rawItems)
      ? rawItems
      : Array.isArray(rawItems?.data)
        ? rawItems.data.map((i: any) => i.data ?? i)
        : []

    items.forEach((raw: any) => {
      const item = raw.data ?? raw
      if (!item?.id) return
      const attrs = item.attributes ?? item
      if (attrs.active === false) return
      if (attrs[todayKey] === false) return
      if (attrs.has_out_of_stock_ingredient) return
      index.set(String(item.id), item as CatalogItem)
    })
  })

  return index
}

function getShopFromStorage(): any {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("shop") : null
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ─── Price calculator ─────────────────────────────────────────────────────────

function calcTotalPrice(catalogItem: CatalogItem, attrs: CustomerOrderItem["attributes"]): number {
  const a = catalogItem.attributes
  const hasDiscount = a.price_with_discount !== null && Number(a.price_with_discount) < Number(a.price)
  const base = hasDiscount ? Number(a.price_with_discount) : Number(a.price)
  const isWeight = a.item_type === "weight_per_kg" || a.item_type === "weight_per_g"

  let total = (isWeight && attrs.weight) ? base * attrs.weight : base
  total *= attrs.quantity

  ;(attrs.selected_extras ?? []).forEach((ex) => {
    const found = a.extra.data.find((e: any) => e.id === ex.id)
    if (found) total += parseFloat(found.attributes.price) * attrs.quantity
  })

  ;(attrs.complements ?? []).forEach((comp) => {
    ;(a.shared_complements?.data ?? []).forEach((group: any) => {
      const opt = group.attributes.options.find(
        (o: any) => o.id.toString() === comp.id.toString(),
      )
      if (opt) total += Number(opt.price) * attrs.quantity
    })
  })

  return total
}

// ─── Cart item builder ────────────────────────────────────────────────────────

function toCartItem(catalogItem: CatalogItem, attrs: CustomerOrderItem["attributes"]): ReorderCartItem {
  const isWeight = catalogItem.attributes.item_type === "weight_per_kg" || catalogItem.attributes.item_type === "weight_per_g"

  const validExtras = (attrs.selected_extras ?? [])
    .map((e) => String(e.id))
    .filter((id) => catalogItem.attributes.extra.data.some((e: any) => String(e.id) === id))

  const validMethods = (attrs.selected_prepare_methods ?? [])
    .map((pm) => String(pm.id))
    .filter((id) => catalogItem.attributes.prepare_method.data.some((m: any) => String(m.id) === id))

  const validOptions: Record<string, string> = {}
  ;(attrs.selected_steps ?? []).forEach((step) => {
    const s = catalogItem.attributes.steps.data.find(
      (s: any) => String(s.id) === String(step.catalog_item_step_id),
    )
    const optOk = s?.attributes.options.data.some(
      (o: any) => String(o.id) === String(step.catalog_item_step_option_id),
    )
    if (s && optOk) validOptions[String(step.catalog_item_step_id)] = String(step.catalog_item_step_option_id)
  })

  const validComplements = (attrs.complements ?? [])
    .map((c) => String(c.id))
    .filter((id) =>
      (catalogItem.attributes.shared_complements?.data ?? []).some((group: any) =>
        group.attributes.options.some((o: any) => String(o.id) === id),
      ),
    )

  return {
    ...catalogItem,
    cartId: crypto.randomUUID(),
    quantity: attrs.quantity,
    weight: isWeight ? (attrs.weight ?? undefined) : undefined,
    selectedExtras: validExtras,
    selectedMethods: validMethods,
    selectedOptions: validOptions,
    selectedSharedComplements: validComplements,
    totalPrice: calcTotalPrice(catalogItem, attrs),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function validateOrder(order: CustomerOrder, shopData?: any): OrderValidation {
  const data = shopData ?? getShopFromStorage()
  const index = buildCatalogIndex(data)
  const orderItems = order.attributes.items?.data ?? []

  const validatedItems: ValidatedOrderItem[] = orderItems.map((oi) => {
    const id = oi.attributes.catalog_item?.data?.id
    const catalogItem = id ? index.get(String(id)) ?? null : null
    return { orderItem: oi, catalogItem, isAvailable: !!catalogItem }
  })

  const unavailableNames = validatedItems
    .filter((v) => !v.isAvailable)
    .map((v) => v.orderItem.attributes.catalog_item?.data?.attributes?.name ?? "Item")

  const cartItems = validatedItems
    .filter((v) => v.isAvailable && v.catalogItem)
    .map((v) => toCartItem(v.catalogItem!, v.orderItem.attributes))

  return {
    validatedItems,
    allAvailable: unavailableNames.length === 0,
    unavailableNames,
    cartItems,
  }
}

export function commitReorder(cartItems: ReorderCartItem[], shopSlug: string): void {
  localStorage.setItem(`cart_${shopSlug}`, JSON.stringify(cartItems))
}
