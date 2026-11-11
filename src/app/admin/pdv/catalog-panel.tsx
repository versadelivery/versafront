"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { BarcodeScannerStatus } from "@/components/admin/barcode-scanner-status";
import { formatPrice } from "@/utils/format-price";
import { cn } from "@/lib/utils";
import { todayDayKey } from "@/app/(public)/[slug]/category-availability";

/* eslint-disable @typescript-eslint/no-explicit-any */

const OTHERS = "uncategorized";

interface CatalogPanelProps {
  groups: any[];
  categories: any[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  scanner: ReturnType<typeof useBarcodeScanner>;
  onItemClick: (item: any) => void;
}

const unitLabel = (attrs: any) =>
  attrs.item_type === "weight_per_kg" ? "/kg" : attrs.item_type === "weight_per_g" ? "/g" : "";

function ItemTile({ item, onClick }: { item: any; onClick: () => void }) {
  const attrs = item.attributes;
  const hasDiscount = attrs.price_with_discount && attrs.price_with_discount !== attrs.price;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-24 flex-col items-center justify-between gap-2 rounded-md border border-[#E5E2DD] bg-[#FAF9F7] px-2 py-3 text-center transition-colors hover:border-primary/40 hover:bg-white active:bg-[#F0EFEB] cursor-pointer"
    >
      <span className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">{attrs.name}</span>
      <span className="leading-tight">
        {hasDiscount && (
          <span className="block text-xs text-muted-foreground line-through">{formatPrice(parseFloat(attrs.price))}</span>
        )}
        <span className={cn("text-sm font-bold", hasDiscount ? "text-green-600" : "text-primary")}>
          {formatPrice(parseFloat(hasDiscount ? attrs.price_with_discount : attrs.price))}
          <span className="text-xs font-medium text-muted-foreground">{unitLabel(attrs)}</span>
        </span>
      </span>
    </button>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="h-8 border border-gray-300 cursor-pointer"
    >
      {children}
    </Button>
  );
}

export function CatalogPanel({
  groups,
  categories,
  isLoading,
  searchTerm,
  onSearchChange,
  scanner,
  onItemClick,
}: CatalogPanelProps) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const searching = searchTerm.trim() !== "";

  // Grupos ativos, com itens ativos, de categorias que abrem hoje
  const { navGroups, categoryEntries } = useMemo(() => {
    const dayKey = todayDayKey();
    const visibleCategories = categories.filter(
      (c: any) => c.attributes?.active !== false && c.attributes?.[dayKey] !== false,
    );
    const visibleIds = new Set(visibleCategories.map((c: any) => String(c.id)));
    const allCategoryIds = new Set(categories.map((c: any) => String(c.id)));

    const navGroups = groups
      .filter((g: any) => g.attributes.active !== false)
      .map((g: any) => ({
        ...g,
        __cat: g.attributes.catalog_category_id ? String(g.attributes.catalog_category_id) : OTHERS,
        attributes: {
          ...g.attributes,
          items: (g.attributes.items ?? []).filter((i: any) => i.attributes?.active !== false),
        },
      }))
      .filter((g: any) => g.attributes.items.length > 0)
      // grupo de categoria que não abre hoje não vende (a API recusa o pedido)
      .filter((g: any) => g.__cat === OTHERS || !allCategoryIds.has(g.__cat) || visibleIds.has(g.__cat));

    const entries = visibleCategories
      .map((c: any) => ({
        id: String(c.id),
        name: c.attributes.name as string,
        groups: navGroups.filter((g: any) => g.__cat === String(c.id)),
      }))
      .filter((c: any) => c.groups.length > 0);
    const others = navGroups.filter((g: any) => g.__cat === OTHERS || !allCategoryIds.has(g.__cat));
    if (entries.length > 0 && others.length > 0) entries.push({ id: OTHERS, name: "Outros", groups: others });

    return { navGroups, categoryEntries: entries };
  }, [groups, categories]);

  const hasCategories = categoryEntries.length > 0;
  const currentCategory = categoryEntries.find((c: any) => c.id === categoryId) ?? null;
  const categoryGroups = currentCategory ? currentCategory.groups : navGroups;
  const term = searchTerm.trim().toLowerCase();

  // Todos os grupos da categoria escolhida, um embaixo do outro, cada um com seus itens. A busca vale para tudo
  const itemSections = useMemo(
    () =>
      (searching ? navGroups : categoryGroups)
        .map((g: any) => ({
          ...g,
          attributes: {
            ...g.attributes,
            items: searching
              ? g.attributes.items.filter(
                  (i: any) =>
                    i.attributes?.name?.toLowerCase().includes(term) ||
                    i.attributes?.description?.toLowerCase().includes(term),
                )
              : g.attributes.items,
          },
        }))
        .filter((g: any) => g.attributes.items.length > 0),
    [searching, navGroups, categoryGroups, term],
  );

  const pickCategory = (id: string | null) => {
    setCategoryId(id);
  };

  return (
    <div className="overflow-hidden rounded-md border border-[#E5E2DD] bg-white">
      <div className="space-y-3 border-b border-[#E5E2DD] px-4 py-4 sm:px-5">
        <h2 className="flex items-center gap-2 font-tomato text-base font-semibold text-gray-900">
          <Package className="h-5 w-5 text-primary" />
          Catálogo de Produtos
        </h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={scanner.inputRef}
            autoFocus
            autoComplete="off"
            aria-label="Buscar produtos ou bipar o código de barras"
            placeholder="Buscar produtos ou bipar o código..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            onKeyDown={scanner.handleKeyDown}
            {...scanner.focusProps}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
              aria-label="Limpar busca"
            >
              ×
            </Button>
          )}
        </div>

        <BarcodeScannerStatus scanner={scanner} />

        {/* Categorias: uma linha que rola para o lado no celular */}
        {!searching && hasCategories && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&>button]:shrink-0">
            <Chip active={categoryId === null} onClick={() => pickCategory(null)}>
              TODOS
            </Chip>
            {categoryEntries.map((c: any) => (
              <Chip key={c.id} active={categoryId === c.id} onClick={() => pickCategory(c.id)}>
                {c.name}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-4 sm:px-5">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : navGroups.length === 0 || itemSections.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              {searching ? "Nenhum produto encontrado" : "Nenhum produto disponível"}
            </p>
            {searching && <p className="mt-2 text-sm text-muted-foreground">Tente buscar por outro termo</p>}
          </div>
        ) : (
          <div className="space-y-6">
            {itemSections.map((g: any) => (
              <section key={g.id}>
                <h3 className="mb-3 flex items-baseline justify-between border-b border-[#E5E2DD] pb-2 font-tomato text-base font-semibold text-gray-900">
                  {g.attributes.name}
                  <span className="text-xs font-normal text-muted-foreground">
                    {g.attributes.items.length} {g.attributes.items.length === 1 ? "produto" : "produtos"}
                  </span>
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                  {g.attributes.items.map((item: any) => (
                    <ItemTile key={item.id} item={item} onClick={() => onItemClick(item)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
