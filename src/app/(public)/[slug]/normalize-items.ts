export function normalizeItems(items: any): CatalogItem[] {
  if (Array.isArray(items)) {
    return items.map((item: any) => item.data ? item.data : item)
  }
  
  if (items?.data && Array.isArray(items.data)) {
    return items.data.map((item: any) => item.data ? item.data : item)
  }

  return []
}