import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CatalogFilters } from "@/components/admin/catalog/catalog-filters";
import {
  CatalogFiltersState,
  StatusFilter,
  ItemTypeFilter,
  TagKey,
} from "@/types/catalog-filters";

interface ActionBarProps {
  onNewCategory: () => void;
  onNewGroup: () => void;
  onNewItem: () => void;
  hasGroups?: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: CatalogFiltersState;
  onStatusChange: (value: StatusFilter) => void;
  onTagsChange: (tags: TagKey[]) => void;
  onItemTypeChange: (value: ItemTypeFilter) => void;
  onDiscountOnlyChange: (value: boolean) => void;
  onOutOfStockIngredientOnlyChange: (value: boolean) => void;
  onClearFilters: () => void;
}

export function ActionBar({
  onNewCategory,
  onNewGroup,
  onNewItem,
  hasGroups = true,
  searchQuery,
  onSearchChange,
  filters,
  onStatusChange,
  onTagsChange,
  onItemTypeChange,
  onDiscountOnlyChange,
  onOutOfStockIngredientOnlyChange,
  onClearFilters,
}: ActionBarProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-3 mb-3">
        <div className="relative w-full sm:w-auto sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome..."
            className="pl-9 text-sm"
          />
        </div>

        <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:shrink-0">
          <Button
            variant="outline"
            className="px-2 sm:px-4 py-2.5 flex items-center justify-center gap-2 text-sm text-muted-foreground border border-gray-300 cursor-pointer"
            onClick={onNewCategory}
          >
            <Plus className="w-4 h-4" />
            <span>Categoria</span>
          </Button>

          <Button
            variant="outline"
            className="px-2 sm:px-4 py-2.5 flex items-center justify-center gap-2 text-sm text-muted-foreground border border-gray-300 cursor-pointer"
            onClick={onNewGroup}
          >
            <Plus className="w-4 h-4" />
            <span>Grupo</span>
          </Button>

          <Button
            className="px-2 sm:px-4 py-2.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 cursor-pointer"
            onClick={onNewItem}
            disabled={!hasGroups}
          >
            <Plus className="w-4 h-4" />
            <span>Item</span>
          </Button>
        </div>
      </div>

      <CatalogFilters
        filters={filters}
        onStatusChange={onStatusChange}
        onTagsChange={onTagsChange}
        onItemTypeChange={onItemTypeChange}
        onDiscountOnlyChange={onDiscountOnlyChange}
        onOutOfStockIngredientOnlyChange={onOutOfStockIngredientOnlyChange}
        onClearFilters={onClearFilters}
      />
    </div>
  );
}
