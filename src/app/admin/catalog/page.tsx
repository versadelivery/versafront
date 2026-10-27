"use client";

import ProtectedRoute from "@/components/protected-route";
import { useCallback, useMemo, useState } from "react";
import GroupModal from "@/components/admin/catalog/group-modal-create";
import { NewItemModal } from "@/components/admin/catalog/item-modal";
import { ActionBar } from "@/components/admin/catalog/action-bar";
import { useCatalogGroup } from "@/hooks/useCatalogGroup";
import { useCatalogReorder } from "@/hooks/useCatalogReorder";
import { ItemCard } from "@/components/admin/catalog/item-card";
import { SortableItemCard } from "@/components/admin/catalog/sortable-item-card";
import { ArrowLeft, Edit2, GripVertical, LayoutGrid, LayoutList, Loader2, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { ComplementManagement } from "@/components/admin/catalog/complement-management";
import { IngredientManagement } from "@/components/admin/catalog/ingredient-management";
import { CategoryModal } from "@/components/admin/catalog/category-modal";
import { CategorySection } from "@/components/admin/catalog/category-manager";
import { useCatalogCategories } from "@/hooks/useCatalogCategories";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CatalogFiltersState,
  StatusFilter,
  ItemTypeFilter,
  TagKey,
  DEFAULT_FILTERS,
} from "@/types/catalog-filters";


// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

const getPriorityColor = (priority?: number) => {
  if (!priority) return "text-muted-foreground";
  if (priority <= 3) return "text-red-500";
  if (priority <= 6) return "text-amber-500";
  return "text-emerald-500";
};

// =============================================================================
// SORTABLE GROUP WRAPPER
// =============================================================================

function SortableGroupWrapper({ id, disabled, children }: { id: string; disabled: boolean; children: (props: { dragHandleProps: Record<string, any> }) => React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({ dragHandleProps: { ...attributes, ...listeners } })}
    </div>
  );
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

function CatalogPage() {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [groupIdToDelete, setGroupIdToDelete] = useState<string | null>(null);
  const [tab, setTab] = useState<"catalog" | "complements" | "ingredients">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<CatalogFiltersState>(DEFAULT_FILTERS);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const [adminLayout, setAdminLayout] = useState<'grid' | 'list'>('grid');

  const { isLoading, catalog, deleteCatalogGroup, isDeletingGroup, toggleCatalogGroupActive, toggleCatalogItemActive } = useCatalogGroup();
  const { reorderGroups, reorderItems } = useCatalogReorder();
  const { categories, reorderCategories } = useCatalogCategories();

  const groups = catalog?.data || [];
  const hasActiveFilters = filters.status !== "all" || filters.tags.length > 0 || filters.itemType !== "all" || filters.discountOnly || filters.outOfStockIngredientOnly;
  const isSearching = searchQuery.trim().length > 0;
  const isFiltering = isSearching || hasActiveFilters;

  const handleStatusChange = useCallback((value: StatusFilter) => setFilters((f) => ({ ...f, status: value })), []);
  const handleTagsChange = useCallback((tags: TagKey[]) => setFilters((f) => ({ ...f, tags })), []);
  const handleItemTypeChange = useCallback((value: ItemTypeFilter) => setFilters((f) => ({ ...f, itemType: value })), []);
  const handleDiscountOnlyChange = useCallback((value: boolean) => setFilters((f) => ({ ...f, discountOnly: value })), []);
  const handleOutOfStockIngredientOnlyChange = useCallback((value: boolean) => setFilters((f) => ({ ...f, outOfStockIngredientOnly: value })), []);
  const handleClearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const validGroups = useMemo(() =>
    [...groups]
      .filter((group: any) => group && group.attributes && group.attributes.name)
      .sort((a: any, b: any) => (a.attributes.priority || 0) - (b.attributes.priority || 0)),
    [groups]
  );

  const categoryIds: string[] = categories.map((category: any) => String(category.id));
  const hasCategories = categories.length > 0;

  // Categorias recolhidas (lembradas neste navegador); por padrão tudo vem expandido
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("catalog-collapsed-categories") || "[]"));
    } catch {
      return new Set();
    }
  });
  const saveCollapsed = (next: Set<string>) => {
    setCollapsed(next);
    try { localStorage.setItem("catalog-collapsed-categories", JSON.stringify([...next])); } catch { /* sem storage: só não lembra */ }
  };
  const toggleCollapsed = (id: string) => {
    const next = new Set(collapsed);
    if (!next.delete(id)) next.add(id);
    saveCollapsed(next);
  };
  const setAllExpanded = (expanded: boolean) =>
    saveCollapsed(expanded ? new Set() : new Set([...categoryIds, "uncategorized"]));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setIsGroupModalOpen(true);
  };

  const handleEditGroup = (groupId: string) => {
    setEditingGroup(groupId);
    setIsGroupModalOpen(true);
  };

  const handleDeleteGroup = async () => {
    if (groupIdToDelete) {
      await deleteCatalogGroup(groupIdToDelete);
      setIsDeleteConfirmationOpen(false);
    }
    setGroupIdToDelete(null);
  };

  const handleCloseGroupModal = () => {
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleGroupDragEnd = (sectionGroupIds: string[]) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sectionGroupIds.indexOf(active.id as string);
    const newIndex = sectionGroupIds.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;
    reorderGroups(arrayMove(sectionGroupIds, oldIndex, newIndex));
  };

  const handleCategoryDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = categoryIds.indexOf(String(active.id));
    const newIndex = categoryIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    reorderCategories(arrayMove(categoryIds, oldIndex, newIndex));
  };

  const handleItemDragEnd = (groupId: string, allItems: any[]) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const itemIds = allItems.map((raw: any) => {
      const node = raw?.data ? raw.data : raw;
      return node.id?.toString();
    });

    const oldIndex = itemIds.indexOf(active.id as string);
    const newIndex = itemIds.indexOf(over.id as string);
    const newOrder = arrayMove(itemIds, oldIndex, newIndex);
    reorderItems({ groupId, orderedIds: newOrder });
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const getItemId = (raw: any): string => {
    const node = raw?.data ? raw.data : raw;
    return node.id?.toString();
  };

  const buildItemProps = (node: any, groupId: string) => ({
    id: parseInt(node.id),
    catalog_group_id: parseInt(groupId),
    name: node.attributes.name,
    active: node.attributes.active,
    description: node.attributes.description,
    item_type: node.attributes.item_type as "unit" | "weight_per_kg" | "weight_per_g",
    price: node.attributes.price,
    price_with_discount: node.attributes.price_with_discount as number,
    starting_price: node.attributes.starting_price as number,
    measure_interval: node.attributes.measure_interval as number,
    min_weight: node.attributes.min_weight as number,
    max_weight: node.attributes.max_weight as number,
    image: node.attributes.image_url as string,
    new_tag: !!(node.attributes as any).new_tag,
    best_seller_tag: !!(node.attributes as any).best_seller_tag,
    highlight: !!(node.attributes as any).highlight,
    promotion_tag: !!(node.attributes as any).promotion_tag,
    has_out_of_stock_ingredient: !!(node.attributes as any).has_out_of_stock_ingredient,
    catalog_item_extras_attributes: node.attributes.extra?.data as unknown as any[],
    catalog_item_prepare_methods_attributes: node.attributes.prepare_method?.data as unknown as any[],
    catalog_item_steps_attributes: node.attributes.steps?.data as unknown as any[],
  });

  const filterItem = (node: any): boolean => {
    const attrs = node.attributes || {};
    const query = searchQuery.trim().toLowerCase();

    if (query && !attrs.name?.toLowerCase().includes(query)) return false;
    if (filters.status === "active" && !attrs.active) return false;
    if (filters.status === "inactive" && attrs.active) return false;
    if (filters.tags.length > 0) {
      const hasTag = filters.tags.some((tag) => !!(attrs as any)[tag]);
      if (!hasTag) return false;
    }
    if (filters.itemType !== "all" && attrs.item_type !== filters.itemType) return false;
    if (filters.discountOnly && !attrs.price_with_discount) return false;
    if (filters.outOfStockIngredientOnly && !(attrs as any).has_out_of_stock_ingredient) return false;

    return true;
  };

  const renderItems = (group: any) => {
    const rawItems: any = (group.attributes as any).items;
    const allItems: any[] = Array.isArray(rawItems)
      ? rawItems
      : rawItems?.data || [];

    const items = isFiltering
      ? allItems.filter((raw: any) => {
          const node = raw?.data ? raw.data : raw;
          return filterItem(node);
        })
      : allItems;

    if (items.length === 0) return null;

    const gridClass = adminLayout === 'list'
      ? "flex flex-col gap-1.5"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3";

    // Se filtro ou busca ativa, renderiza sem drag
    if (isFiltering) {
      return (
        <div className={gridClass}>
          {items.map((raw: any) => {
            const node = raw?.data ? raw.data : raw;
            return (
              <ItemCard key={node.id} item={buildItemProps(node, group.id)} layout={adminLayout} />
            );
          })}
        </div>
      );
    }

    const itemIds = allItems.map(getItemId);

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleItemDragEnd(group.id, allItems)}
      >
        <SortableContext items={itemIds} strategy={adminLayout === 'list' ? verticalListSortingStrategy : rectSortingStrategy}>
          <div className={gridClass}>
            {allItems.map((raw: any) => {
              const node = raw?.data ? raw.data : raw;
              const id = node.id?.toString();
              return (
                <SortableItemCard
                  key={id}
                  id={id}
                  item={buildItemProps(node, group.id)}
                  layout={adminLayout}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  const renderGroupCard = (group: any) => {
    const itemsContent = renderItems(group);
    if (isFiltering && itemsContent === null) return null;

    return (
            <SortableGroupWrapper key={group.id} id={group.id} disabled={isFiltering}>
              {({ dragHandleProps }) => (
                <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
                  {/* Header do grupo */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E2DD]">
                    <div className="flex items-center flex-1 min-w-0 mr-3 gap-2">
                      {!isFiltering && (
                        <div
                          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                          {...dragHandleProps}
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h2 className="font-tomato text-base font-semibold text-foreground truncate">
                          {group.attributes.name}
                        </h2>
                        {group.attributes.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                            {group.attributes.description}
                          </p>
                        )}
                        {group.attributes.priority && (
                          <p className={`text-[11px] font-medium mt-1 ${getPriorityColor(group.attributes.priority)}`}>
                            Prioridade: {group.attributes.priority}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Container Status/Editar do Grupo */}
                      <div className="bg-white rounded-md py-1 px-3 flex items-center border border-[#E5E2DD] gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                            {group.attributes.active ? "Ativo" : "Pausado"}
                          </span>
                          <Switch
                            checked={group.attributes.active}
                            onCheckedChange={(checked) => {
                              toggleCatalogGroupActive({ id: group.id, active: checked });
                            }}
                            className="scale-[0.6] origin-center"
                          />
                        </div>

                        <div className="w-[1px] h-3 bg-[#E5E2DD]" />

                        <button
                          className="cursor-pointer flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight"
                          onClick={() => handleEditGroup(group.id)}
                        >
                          <Edit2 className="h-3 w-3" />
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items do grupo */}
                  <div className="p-3">
                    {itemsContent || (
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground">Este grupo não possui itens</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </SortableGroupWrapper>
    );
  };

  // =============================================================================
  // CATEGORIAS > GRUPOS > ITENS (cada nível ordena só dentro do pai)
  // =============================================================================

  const sectionFor = (categoryId: string | null) => {
    const sectionGroups = validGroups.filter((g: any) => {
      const own = g.attributes.catalog_category_id;
      return categoryId === null
        ? !own || !categories.some((c: any) => String(c.id) === String(own))
        : String(own) === String(categoryId);
    });
    const cards = sectionGroups.map((g: any) => ({ group: g, node: renderGroupCard(g) })).filter((entry: any) => entry.node);
    return { groups: sectionGroups, cards };
  };

  const renderGroupList = (section: { groups: any[]; cards: any[] }) => {
    if (section.groups.length === 0) {
      return (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-[#E5E2DD] bg-white px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">Nenhum grupo nesta categoria</p>
          <Button size="sm" variant="outline" className="cursor-pointer gap-2" onClick={handleCreateGroup}>
            <Plus className="h-4 w-4" /> Novo grupo
          </Button>
        </div>
      );
    }
    const ids = section.groups.map((g: any) => g.id);
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleGroupDragEnd(ids)}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-4">{section.cards.map((entry: any) => entry.node)}</div>
        </SortableContext>
      </DndContext>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FAF9F7]">
        <div className="bg-white border-b border-[#E5E2DD]">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <a href="/admin" className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:block">Voltar</span>
                </a>
                <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
                <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">Cardápio</h1>
              </div>
              <div className="flex items-center gap-3">
                {tab === "catalog" && (
                  <div className="hidden sm:flex items-center bg-[#F0EFEB] p-0.5 rounded-md border border-[#E5E2DD]">
                    <button
                      onClick={() => setAdminLayout('grid')}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${adminLayout === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      title="Visualização em grade"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAdminLayout('list')}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${adminLayout === 'list' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      title="Visualização em lista"
                    >
                      <LayoutList className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-1 bg-[#F0EFEB] p-1 rounded-md">
                <button
                  onClick={() => setTab("catalog")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                    tab === "catalog"
                      ? "bg-white text-primary border border-[#E5E2DD]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Cardápio
                </button>
                <button
                  onClick={() => setTab("complements")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                    tab === "complements"
                      ? "bg-white text-primary border border-[#E5E2DD]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Adicionais
                </button>
                <button
                  onClick={() => setTab("ingredients")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                    tab === "ingredients"
                      ? "bg-white text-primary border border-[#E5E2DD]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Ingredientes
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6">

          {tab === "catalog" ? (
            <>
              <ActionBar
                onNewGroup={handleCreateGroup}
                onNewItem={() => setIsItemModalOpen(true)}
                hasGroups={validGroups.length > 0}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filters={filters}
                onStatusChange={handleStatusChange}
                onTagsChange={handleTagsChange}
                onItemTypeChange={handleItemTypeChange}
                onDiscountOnlyChange={handleDiscountOnlyChange}
                onOutOfStockIngredientOnlyChange={handleOutOfStockIngredientOnlyChange}
                onClearFilters={handleClearFilters}
              />

              <CategoryModal open={isCategoryModalOpen} onOpenChange={(open) => { setIsCategoryModalOpen(open); if (!open) setEditingCategory(null); }} category={editingCategory} />

              <GroupModal
                isOpen={isGroupModalOpen}
                onOpenChange={(open) => {
                  if (!open) handleCloseGroupModal();
                }}
                editingGroup={editingGroup}
              />
              <NewItemModal isOpen={isItemModalOpen} onOpenChange={setIsItemModalOpen} />

              {/* Loading */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center w-full py-12 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Carregando cardápio...</p>
                </div>
              ) : validGroups.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Package className="h-10 w-10 text-muted-foreground" />
                  <h3 className="font-tomato text-base font-semibold text-foreground">Nenhum grupo encontrado</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
                    Crie seu primeiro grupo para começar a organizar seus produtos
                  </p>
                  <Button onClick={handleCreateGroup} className="gap-2 border border-gray-300 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Grupo
                  </Button>
                </div>
              ) : (
                /* Categorias com grupos */
                <div className="flex w-full flex-col gap-3 pb-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-3xl text-xs text-muted-foreground">
                      {hasCategories
                        ? <>A ordem vale dentro de cada nível: categorias entre si, grupos dentro da categoria e itens dentro do grupo. Arraste pelo ícone <GripVertical className="inline h-3 w-3" />.</>
                        : "Crie categorias (ex.: Churrasco, Bebidas) para organizar os grupos do cardápio."}
                    </p>
                    <div className="flex items-center gap-1">
                      {hasCategories && !isFiltering && (
                        <>
                          <Button size="sm" variant="ghost" className="h-8 cursor-pointer text-xs" onClick={() => setAllExpanded(true)}>Expandir tudo</Button>
                          <Button size="sm" variant="ghost" className="h-8 cursor-pointer text-xs" onClick={() => setAllExpanded(false)}>Recolher tudo</Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" className="h-8 cursor-pointer gap-2" onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }}>
                        <Plus className="h-4 w-4" /> Nova categoria
                      </Button>
                    </div>
                  </div>

                  {hasCategories ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                      <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
                        {categories.map((category: any, index: number) => {
                          const section = sectionFor(category.id);
                          if (isFiltering && section.cards.length === 0) return null;
                          return (
                            <CategorySection
                              key={category.id}
                              category={category}
                              position={index + 1}
                              groupCount={section.groups.length}
                              expanded={isFiltering || !collapsed.has(category.id)}
                              onToggleExpanded={() => toggleCollapsed(category.id)}
                              onEdit={() => handleEditCategory(category)}
                            >
                              {renderGroupList(section)}
                            </CategorySection>
                          );
                        })}
                      </SortableContext>
                    </DndContext>
                  ) : null}

                  {(() => {
                    const section = sectionFor(null);
                    if (hasCategories && section.groups.length === 0) return null;
                    if (isFiltering && section.cards.length === 0) return null;
                    return hasCategories ? (
                      <CategorySection
                        groupCount={section.groups.length}
                        expanded={isFiltering || !collapsed.has("uncategorized")}
                        onToggleExpanded={() => toggleCollapsed("uncategorized")}
                      >
                        {renderGroupList(section)}
                      </CategorySection>
                    ) : renderGroupList(section);
                  })()}
                </div>
              )}
            </>
          ) : tab === "complements" ? (
            <ComplementManagement />
          ) : (
            <IngredientManagement />
          )}
        </div>

      </div>

      <DeleteConfirmation
        isOpen={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        onConfirm={handleDeleteGroup}
        isLoading={isDeletingGroup}
        type="grupo"
      />
    </ProtectedRoute>
  );
}

export default CatalogPage;
