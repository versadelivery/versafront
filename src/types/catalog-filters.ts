export type StatusFilter = "all" | "active" | "inactive";

export type ItemTypeFilter = "all" | "unit" | "weight_per_kg" | "weight_per_g";

export type TagKey = "promotion_tag" | "best_seller_tag" | "new_tag" | "highlight";

export interface CatalogFiltersState {
  status: StatusFilter;
  tags: TagKey[];
  itemType: ItemTypeFilter;
  discountOnly: boolean;
  outOfStockIngredientOnly: boolean;
}

export const DEFAULT_FILTERS: CatalogFiltersState = {
  status: "all",
  tags: [],
  itemType: "all",
  discountOnly: false,
  outOfStockIngredientOnly: false,
};
