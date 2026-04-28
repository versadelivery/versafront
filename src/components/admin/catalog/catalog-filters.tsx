"use client";

import { useState } from "react";
import { Filter, X, Percent, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onOutOfStockIngredientOnlyChange: (value: boolean) => void;
  onClearFilters: () => void;
}

const TAG_OPTIONS: { key: TagKey; label: string }[] = [
  { key: "promotion_tag", label: "Promoção" },
  { key: "best_seller_tag", label: "+Vendido" },
  { key: "new_tag", label: "Novo" },
  { key: "highlight", label: "Destaque" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

const ITEM_TYPE_OPTIONS: { value: ItemTypeFilter; label: string }[] = [
  { value: "all", label: "Todos os tipos" },
  { value: "unit", label: "Unidade" },
  { value: "weight_per_kg", label: "Por Kg" },
  { value: "weight_per_g", label: "Por Grama" },
];

function hasActiveFilters(filters: CatalogFiltersState): boolean {
  return (
    filters.status !== DEFAULT_FILTERS.status ||
    filters.tags.length > 0 ||
    filters.itemType !== DEFAULT_FILTERS.itemType ||
    filters.discountOnly !== DEFAULT_FILTERS.discountOnly ||
    filters.outOfStockIngredientOnly !== DEFAULT_FILTERS.outOfStockIngredientOnly
  );
}

function countActiveFilters(filters: CatalogFiltersState): number {
  let count = 0;
  if (filters.status !== DEFAULT_FILTERS.status) count++;
  if (filters.tags.length > 0) count++;
  if (filters.itemType !== DEFAULT_FILTERS.itemType) count++;
  if (filters.discountOnly) count++;
  if (filters.outOfStockIngredientOnly) count++;
  return count;
}

export function CatalogFilters({
  filters,
  onStatusChange,
  onTagsChange,
  onItemTypeChange,
  onDiscountOnlyChange,
  onOutOfStockIngredientOnlyChange,
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

  const pillClass = (active: boolean) =>
    `px-3 py-1.5 text-sm font-medium rounded-md border transition-colors cursor-pointer select-none ${
      active
        ? "bg-white border-primary text-primary"
        : "bg-white border-[#E5E2DD] text-muted-foreground hover:border-gray-400 hover:text-foreground"
    }`;

  const filtersContent = (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status */}
      <div className="flex items-center gap-1 bg-[#F0EFEB] p-1 rounded-md">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onStatusChange(value)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              filters.status === value
                ? "bg-white text-gray-900 border border-[#E5E2DD]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="hidden sm:block w-px h-6 bg-[#E5E2DD]" />

      {/* Tags */}
      {TAG_OPTIONS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => toggleTag(key)}
          className={pillClass(filters.tags.includes(key))}
        >
          {label}
        </button>
      ))}

      <div className="hidden sm:block w-px h-6 bg-[#E5E2DD]" />

      {/* Tipo de Item */}
      <div className="flex items-center gap-1 bg-[#F0EFEB] p-1 rounded-md">
        {ITEM_TYPE_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onItemTypeChange(value)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              filters.itemType === value
                ? "bg-white text-gray-900 border border-[#E5E2DD]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="hidden sm:block w-px h-6 bg-[#E5E2DD]" />

      {/* Com Desconto */}
      <button
        onClick={() => onDiscountOnlyChange(!filters.discountOnly)}
        className={`inline-flex items-center gap-1.5 ${pillClass(filters.discountOnly)}`}
      >
        <Percent className="h-3.5 w-3.5" />
        Com desconto
      </button>

      {/* Sem Ingrediente */}
      <button
        onClick={() => onOutOfStockIngredientOnlyChange(!filters.outOfStockIngredientOnly)}
        className={`inline-flex items-center gap-1.5 ${pillClass(filters.outOfStockIngredientOnly)}`}
      >
        <AlertCircle className="h-3.5 w-3.5" />
        Ingrediente em falta
      </button>

      {/* Limpar Filtros */}
      {isActive && (
        <button
          onClick={onClearFilters}
          className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors cursor-pointer rounded-md hover:bg-white"
        >
          <X className="h-3.5 w-3.5" />
          Limpar
        </button>
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
          className="w-full justify-center gap-2 text-sm border border-gray-300 cursor-pointer"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <Badge variant="default" className="ml-1 text-[10px] px-1.5 py-0 min-w-[18px] h-[18px] rounded-md">
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
