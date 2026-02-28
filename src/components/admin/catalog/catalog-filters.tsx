"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CatalogFiltersState,
  StatusFilter,
  ItemTypeFilter,
  TagKey,
  DEFAULT_FILTERS,
} from "@/types/catalog-filters";

interface CatalogFiltersProps {
  filters: CatalogFiltersState;
  onStatusChange: (value: StatusFilter) => void;
  onTagsChange: (tags: TagKey[]) => void;
  onItemTypeChange: (value: ItemTypeFilter) => void;
  onDiscountOnlyChange: (value: boolean) => void;
  onClearFilters: () => void;
}

const TAG_OPTIONS: { key: TagKey; label: string }[] = [
  { key: "promotion_tag", label: "Promoção" },
  { key: "best_seller_tag", label: "+Vendido" },
  { key: "new_tag", label: "Novo" },
  { key: "highlight", label: "Destaque" },
];

function hasActiveFilters(filters: CatalogFiltersState): boolean {
  return (
    filters.status !== DEFAULT_FILTERS.status ||
    filters.tags.length > 0 ||
    filters.itemType !== DEFAULT_FILTERS.itemType ||
    filters.discountOnly !== DEFAULT_FILTERS.discountOnly
  );
}

function countActiveFilters(filters: CatalogFiltersState): number {
  let count = 0;
  if (filters.status !== DEFAULT_FILTERS.status) count++;
  if (filters.tags.length > 0) count++;
  if (filters.itemType !== DEFAULT_FILTERS.itemType) count++;
  if (filters.discountOnly) count++;
  return count;
}

export function CatalogFilters({
  filters,
  onStatusChange,
  onTagsChange,
  onItemTypeChange,
  onDiscountOnlyChange,
  onClearFilters,
}: CatalogFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = hasActiveFilters(filters);
  const activeCount = countActiveFilters(filters);

  const toggleTag = (tag: TagKey) => {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onTagsChange(next);
  };

  const filtersContent = (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status */}
      <Select value={filters.status} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
        <SelectTrigger size="sm" className="min-w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
        </SelectContent>
      </Select>

      {/* Divider */}
      <div className="hidden sm:block w-px h-6 bg-gray-200" />

      {/* Tags */}
      <div className="flex items-center gap-2">
        {TAG_OPTIONS.map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
          >
            <Checkbox
              checked={filters.tags.includes(key)}
              onCheckedChange={() => toggleTag(key)}
            />
            {label}
          </label>
        ))}
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-6 bg-gray-200" />

      {/* Tipo de Item */}
      <Select value={filters.itemType} onValueChange={(v) => onItemTypeChange(v as ItemTypeFilter)}>
        <SelectTrigger size="sm" className="min-w-[160px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="unit">Unidade</SelectItem>
          <SelectItem value="weight_per_kg">Por Kg</SelectItem>
          <SelectItem value="weight_per_g">Por Grama</SelectItem>
        </SelectContent>
      </Select>

      {/* Divider */}
      <div className="hidden sm:block w-px h-6 bg-gray-200" />

      {/* Com Desconto */}
      <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
        <Checkbox
          checked={filters.discountOnly}
          onCheckedChange={(checked) => onDiscountOnlyChange(checked === true)}
        />
        Com desconto
      </label>

      {/* Limpar Filtros */}
      {isActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-xs text-muted-foreground hover:text-destructive gap-1 ml-auto"
        >
          <X className="h-3 w-3" />
          Limpar filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="mb-4">
      {/* Mobile: toggle button */}
      <div className="sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-center gap-2 text-sm"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <Badge variant="default" className="ml-1 text-[10px] px-1.5 py-0 min-w-[18px] h-[18px]">
              {activeCount}
            </Badge>
          )}
        </Button>
        {isOpen && <div className="mt-3">{filtersContent}</div>}
      </div>

      {/* Desktop: always visible */}
      <div className="hidden sm:block">{filtersContent}</div>
    </div>
  );
}
