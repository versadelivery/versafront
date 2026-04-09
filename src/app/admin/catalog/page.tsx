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
import { ArrowLeft, Edit2, GripVertical, Loader2, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { ComplementManagement } from "@/components/admin/catalog/complement-management";
import { IngredientManagement } from "@/components/admin/catalog/ingredient-management";
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

  const { isLoading, catalog, deleteCatalogGroup, isDeletingGroup, toggleCatalogGroupActive, toggleCatalogItemActive } = useCatalogGroup();
  const { reorderGroups, reorderItems } = useCatalogReorder();

  const groups = catalog?.data || [];
  const hasActiveFilters = filters.status !== "all" || filters.tags.length > 0 || filters.itemType !== "all" || filters.discountOnly;
  const isSearching = searchQuery.trim().length > 0;
  const isFiltering = isSearching || hasActiveFilters;

  const handleStatusChange = useCallback((value: StatusFilter) => setFilters((f) => ({ ...f, status: value })), []);
  const handleTagsChange = useCallback((tags: TagKey[]) => setFilters((f) => ({ ...f, tags })), []);
  const handleItemTypeChange = useCallback((value: ItemTypeFilter) => setFilters((f) => ({ ...f, itemType: value })), []);
  const handleDiscountOnlyChange = useCallback((value: boolean) => setFilters((f) => ({ ...f, discountOnly: value })), []);
  const handleClearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const validGroups = useMemo(() =>
    [...groups]
      .filter((group: any) => group && group.attributes && group.attributes.name)
      .sort((a: any, b: any) => (b.attributes.priority || 0) - (a.attributes.priority || 0)),
    [groups]
  );

  const groupIds = useMemo(() => validGroups.map((g: any) => g.id), [validGroups]);

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

  const handleGroupDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = groupIds.indexOf(active.id as string);
    const newIndex = groupIds.indexOf(over.id as string);
    const newOrder = arrayMove(groupIds, oldIndex, newIndex);
    reorderGroups(newOrder);
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

    // Se filtro ou busca ativa, renderiza sem drag
    if (isFiltering) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {items.map((raw: any) => {
            const node = raw?.data ? raw.data : raw;
            return (
              <ItemCard key={node.id} item={buildItemProps(node, group.id)} />
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
        <SortableContext items={itemIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {allItems.map((raw: any) => {
              const node = raw?.data ? raw.data : raw;
              const id = node.id?.toString();
              return (
                <SortableItemCard
                  key={id}
                  id={id}
                  item={buildItemProps(node, group.id)}
                />
              );
            })}
          </div>
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
                <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">Catálogo</h1>
              </div>
              <div className="flex items-center gap-1 bg-[#F0EFEB] p-1 rounded-md">
                <button
                  onClick={() => setTab("catalog")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                    tab === "catalog"
                      ? "bg-white text-primary border border-[#E5E2DD]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Catálogo
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
                onClearFilters={handleClearFilters}
              />

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
                  <p className="text-sm text-muted-foreground">Carregando catálogo...</p>
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
                /* Lista de Grupos */
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleGroupDragEnd}
                >
                  <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-4 w-full pb-8">
                      {validGroups.map((group: any) => {
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
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
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
