"use client";

import ProtectedRoute from "@/components/protected-route";
import AdminHeader from "@/components/admin/catalog-header";
import { useState } from "react";
import GroupModal from "@/components/admin/catalog/group-modal-create";
import { NewItemModal } from "@/components/admin/catalog/item-modal";
import { ActionBar } from "@/components/admin/catalog/action-bar";
import { useCatalogGroup } from "@/hooks/useCatalogGroup";
import { ItemCard } from "@/components/admin/catalog/item-card";
import { Edit2, Loader2, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { ComplementManagement } from "@/components/admin/catalog/complement-management";


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
// COMPONENTE PRINCIPAL
// =============================================================================

function CatalogPage() {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [groupIdToDelete, setGroupIdToDelete] = useState<string | null>(null);
  const [tab, setTab] = useState<"catalog" | "complements">("catalog");
  const [searchQuery, setSearchQuery] = useState("");


  const { isLoading, catalog, deleteCatalogGroup, isDeletingGroup, toggleCatalogGroupActive, toggleCatalogItemActive } = useCatalogGroup();
  const groups = catalog?.data || [];

  const validGroups = [...groups]
    .filter((group: any) => group && group.attributes && group.attributes.name)
    .sort((a: any, b: any) => (b.attributes.priority || 0) - (a.attributes.priority || 0));

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

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <AdminHeader
          title="CATÁLOGO"
          description="Gerencie seu catálogo, estoque e disponibilidade dos itens"
        />

        <div className="flex-1 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto w-full">
          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg w-fit mb-6">
            <button
              onClick={() => setTab("catalog")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                tab === "catalog"
                  ? "bg-white shadow-sm text-primary border border-gray-100"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Catálogo
            </button>
            <button
              onClick={() => setTab("complements")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                tab === "complements"
                  ? "bg-white shadow-sm text-primary border border-gray-100"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Adicionais
            </button>
          </div>

          {tab === "catalog" ? (
            <>
              <ActionBar
                onNewGroup={handleCreateGroup}
                onNewItem={() => setIsItemModalOpen(true)}
                hasGroups={validGroups.length > 0}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
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
                  <h3 className="text-base font-semibold text-foreground">Nenhum grupo encontrado</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
                    Crie seu primeiro grupo para começar a organizar seus produtos
                  </p>
                  <Button onClick={handleCreateGroup} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Grupo
                  </Button>
                </div>
              ) : (
                /* Lista de Grupos */
                <div className="flex flex-col gap-4 w-full pb-8">
                  {validGroups.map((group: any) => (
                    <div
                      key={group.id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                      {/* Header do grupo */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <div className="flex-1 min-w-0 mr-3">
                          <h2 className="text-base font-semibold text-foreground truncate">
                            {group.attributes.name}
                          </h2>
                          {group.attributes.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {group.attributes.description}
                            </p>
                          )}
                          {group.attributes.priority && (
                            <p className={`text-[11px] font-medium mt-1 ${getPriorityColor(group.attributes.priority)}`}>
                              Prioridade: {group.attributes.priority}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Container Status/Editar do Grupo */}
                          <div className="bg-gray-50/80 rounded-full py-1 px-3 flex items-center border border-gray-200 gap-3">
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

                            <div className="w-[1px] h-3 bg-gray-300" />

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
                        {(() => {
                          const rawItems: any = (group.attributes as any).items;
                          const allItems: any[] = Array.isArray(rawItems)
                            ? rawItems
                            : rawItems?.data || [];

                          const query = searchQuery.trim().toLowerCase();
                          const items = query
                            ? allItems.filter((raw: any) => {
                                const node = raw?.data ? raw.data : raw;
                                return node.attributes?.name?.toLowerCase().includes(query);
                              })
                            : allItems;

                          if (items.length === 0) {
                            return (
                              <div className="text-center py-6">
                                <p className="text-sm text-muted-foreground">
                                  {query ? "Nenhum item encontrado" : "Este grupo não possui itens"}
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                              {items.map((raw: any) => {
                                const node = raw?.data ? raw.data : raw;
                                const attrs = node.attributes;
                                return (
                                  <ItemCard
                                    key={node.id}
                                    item={{
                                      id: parseInt(node.id),
                                      catalog_group_id: parseInt(group.id),
                                      name: attrs.name,
                                      active: attrs.active,
                                      description: attrs.description,
                                      item_type: attrs.item_type as "unit" | "weight_per_kg" | "weight_per_g",
                                      price: attrs.price,
                                      price_with_discount: attrs.price_with_discount as number,
                                      measure_interval: attrs.measure_interval as number,
                                      min_weight: attrs.min_weight as number,
                                      max_weight: attrs.max_weight as number,
                                      image: attrs.image_url as string,
                                      new_tag: !!(attrs as any).new_tag,
                                      best_seller_tag: !!(attrs as any).best_seller_tag,
                                      highlight: !!(attrs as any).highlight,
                                      promotion_tag: !!(attrs as any).promotion_tag,
                                      catalog_item_extras_attributes: attrs.extra?.data as unknown as any[],
                                      catalog_item_prepare_methods_attributes: attrs.prepare_method?.data as unknown as any[],
                                      catalog_item_steps_attributes: attrs.steps?.data as unknown as any[],
                                    }}
                                  />
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <ComplementManagement />
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
