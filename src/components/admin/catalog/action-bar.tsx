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
  onClearFilters: () => void;
}

export function ActionBar({
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
  onClearFilters,
}: ActionBarProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-3 mb-3">
        <div className="relative flex-[2]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome..."
            className="pl-9 text-sm"
          />
        </div>

        <Button
          variant="outline"
          className="flex-1 py-2.5 px-4 flex items-center justify-center gap-2 text-sm text-muted-foreground border border-gray-300 cursor-pointer"
          onClick={onNewGroup}
        >
          <Plus className="w-4 h-4" />
          <span>Novo Grupo</span>
        </Button>

        <Button
          className="flex-1 py-2.5 px-4 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 cursor-pointer"
          onClick={onNewItem}
          disabled={!hasGroups}
        >
          <Plus className="w-4 h-4" />
          <span>Novo Item</span>
        </Button>
      </div>

      <CatalogFilters
        filters={filters}
        onStatusChange={onStatusChange}
        onTagsChange={onTagsChange}
        onItemTypeChange={onItemTypeChange}
        onDiscountOnlyChange={onDiscountOnlyChange}
        onClearFilters={onClearFilters}
      />
    </div>
  );
}
