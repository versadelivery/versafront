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
      setIsDeleteConfirmationOpen(true);
    }
    setIsDeleteConfirmationOpen(false);
    setGroupIdToDelete(null);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-full">
          <AdminHeader
            title="CATÁLOGO"
            description="Gerencie seu catálogo, estoque e disponibilidade dos itens"
          />
          <ActionBar onNewGroup={() => setIsGroupModalOpen(true)} onNewItem={() => setIsItemModalOpen(true)} />
          <GroupModal isOpen={isGroupModalOpen} onOpenChange={setIsGroupModalOpen} />
          <GroupModalEdit isOpen={isGroupModalOpenEdit} onOpenChange={setIsGroupModalOpenEdit} editingGroup={editingGroup as never} />
          <NewItemModal isOpen={isItemModalOpen} onOpenChange={setIsItemModalOpen} />
          {isLoading ? (
            <div className="flex justify-center w-full">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full">
              {catalog?.data?.map((group) => (
                <div key={group.id} className="flex flex-col gap-4 bg-accent p-3 sm:p-4 md:p-6 rounded-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                  <h2 className="text-xl font-semibold text-gray-800 break-words">{group.attributes.name}</h2>
                  <div className="flex gap-1 sm:gap-2 py-2 sm:py-4">
                  <Button 
                    variant="ghost" 
                    className="font-outfit rounded-xs py-2 px-3 sm:py-3 sm:px-6 flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 border-none shadow-none text-muted-foreground text-xs sm:text-sm"
                    onClick={() => handleEditGroup(group.id)}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="font-outfit rounded-xs py-2 px-3 sm:py-3 sm:px-6 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 border-none shadow-none text-muted-foreground text-xs sm:text-sm"
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
                  <div className="w-full overflow-x-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {group.attributes.items.length === 0 ? (
                        <div className="col-span-full text-start text-gray-500">
                          Este grupo não possui itens
                        </div>
                      ) : (
                        group.attributes.items.map((item) => (
                          <div key={item.data.id} className="min-h-[350px] w-full max-w-xs sm:max-w-sm mx-auto">
                            <ItemCard 
                              key={item.data.id} 
                              item={{
                                id: parseInt(item.data.id),
                                catalog_group_id: parseInt(group.id),
                                name: item.data.attributes.name,
                                description: item.data.attributes.description,
                                item_type: item.data.attributes.item_type as 'unit' | 'weight_per_kg' | 'weight_per_g',
                                price: item.data.attributes.price,
                                price_with_discount: item.data.attributes.price_with_discount as number,
                                measure_interval: item.data.attributes.measure_interval as number,
                                min_weight: item.data.attributes.min_weight as number,
                                max_weight: item.data.attributes.max_weight as number,
                                image: item.data.attributes.image_url as string,
                                catalog_item_extras_attributes: item.data.attributes.extra.data as unknown as any[],
                                catalog_item_prepare_methods_attributes: item.data.attributes.prepare_method.data as unknown as any[],
                                catalog_item_steps_attributes: item.data.attributes.steps.data as unknown as any[]
                              }} 
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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