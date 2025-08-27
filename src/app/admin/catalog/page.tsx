"use client"

import ProtectedRoute from "@/components/protected-route"
import AdminHeader from "@/components/admin/catalog-header";
import { useState } from "react";
import GroupModal from "@/components/admin/catalog/group-modal-create";
import { NewItemModal } from "@/components/admin/catalog/item-modal";
import { ActionBar } from "@/components/admin/catalog/action-bar";
import { useCatalogGroup } from "@/hooks/useCatalogGroup";
import { ItemCard } from "@/components/admin/catalog/item-card";
import { Edit2, Loader2, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import GroupModalEdit from "@/components/admin/catalog/group-modal";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";

function CatalogPage() {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isGroupModalOpenEdit, setIsGroupModalOpenEdit] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [groupIdToDelete, setGroupIdToDelete] = useState<string | null>(null);
  const { isLoading, catalog, deleteCatalogGroup, isDeletingGroup } = useCatalogGroup();
  const handleEditGroup = (groupId: string) => {
    setEditingGroup(groupId);
    setIsGroupModalOpenEdit(true);
  };

  const handleDeleteGroup = async () => {
    if (groupIdToDelete) {
      await deleteCatalogGroup(groupIdToDelete);
      // Close confirmation after successful deletion
      setIsDeleteConfirmationOpen(false);
    }
    setGroupIdToDelete(null);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <AdminHeader
          title="CATÁLOGO"
          description="Gerencie seu catálogo, estoque e disponibilidade dos itens"
        />
        
        <div className="flex-1 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto w-full">
          <ActionBar onNewGroup={() => setIsGroupModalOpen(true)} onNewItem={() => setIsItemModalOpen(true)} />
          
          <GroupModal isOpen={isGroupModalOpen} onOpenChange={setIsGroupModalOpen} />
          <GroupModalEdit isOpen={isGroupModalOpenEdit} onOpenChange={setIsGroupModalOpenEdit} editingGroup={editingGroup as never} />
          <NewItemModal isOpen={isItemModalOpen} onOpenChange={setIsItemModalOpen} />
          
          {isLoading ? (
            <div className="flex justify-center w-full py-12">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full pb-8">
              {catalog?.data?.map((group) => (
                <div key={group.id} className="flex flex-col gap-4 bg-accent p-4 sm:p-6 lg:p-8 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
                    <h2 className="text-xl font-semibold text-gray-800 break-words">{group.attributes.name}</h2>
                    <div className="flex gap-2 sm:gap-3">
                      <Button 
                        variant="ghost" 
                        className="font-outfit rounded-xs py-2 px-4 sm:py-3 sm:px-6 flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 border-none shadow-none text-muted-foreground text-sm"
                        onClick={() => handleEditGroup(group.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Editar</span>
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="font-outfit rounded-xs py-2 px-4 sm:py-3 sm:px-6 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 border-none shadow-none text-sm"
                        onClick={() => {
                          setGroupIdToDelete(group.id);
                          setIsDeleteConfirmationOpen(true);
                        }}
                      >
                        <Trash className="w-4 h-4 text-white" />
                        <span className="text-white">Excluir</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {(() => {
                        const rawItems: any = (group.attributes as any).items;
                        const items: any[] = Array.isArray(rawItems)
                          ? rawItems
                          : (rawItems?.data || []);
                        if (items.length === 0) {
                          return (
                            <div className="col-span-full text-start text-gray-500 py-8">
                              Este grupo não possui itens
                            </div>
                          );
                        }
                        return items.map((raw: any) => {
                          const node = raw?.data ? raw.data : raw;
                          const attrs = node.attributes;
                          return (
                            <div key={node.id} className="min-h-[350px] w-full">
                              <ItemCard 
                                key={node.id} 
                                item={{
                                  id: parseInt(node.id),
                                  catalog_group_id: parseInt(group.id),
                                  name: attrs.name,
                                  description: attrs.description,
                                  item_type: attrs.item_type as 'unit' | 'weight_per_kg' | 'weight_per_g',
                                  price: attrs.price,
                                  price_with_discount: attrs.price_with_discount as number,
                                  measure_interval: attrs.measure_interval as number,
                                  min_weight: attrs.min_weight as number,
                                  max_weight: attrs.max_weight as number,
                                  image: attrs.image_url as string,
                                  catalog_item_extras_attributes: attrs.extra?.data as unknown as any[],
                                  catalog_item_prepare_methods_attributes: attrs.prepare_method?.data as unknown as any[],
                                  catalog_item_steps_attributes: attrs.steps?.data as unknown as any[]
                                }} 
                              />
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
  )
}

export default CatalogPage