"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/protected-route";
import { Header } from "@/components/catalog/catalog-header";
import { ActionBar } from "./action-bar";
import { ProductGroup } from "@/components/catalog/product-group";
import { GroupModal } from "@/components/catalog/group-modal";
import { NewItemModal } from "@/components/catalog/item-modal/new-item-modal";
import { UICatalogGroup, UICatalogItem } from "@/types/catalog";
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from "@/hooks/use-group";
import { useCreateItem, useDeleteItem, useUpdateItem } from "@/hooks/use-item";
import { Loader2 } from "lucide-react";
import { GroupFormValues } from "@/schemas/group-schema";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function CatalogPage() {
  const queryClient = useQueryClient();
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UICatalogGroup | null>(null);
  const [editingItem, setEditingItem] = useState<UICatalogItem | null>(null);
  
  const { data: groups = [], isLoading, error } = useGroups();
  
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();
  const createItemMutation = useCreateItem();
  const updateItemMutation = useUpdateItem();
  const deleteItemMutation = useDeleteItem();

  const handleSaveGroup = async (values: GroupFormValues) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description || '');
    formData.append('priority', values.priority.toString());

    if (values.removeImage) {
      formData.append('image', '');
    } else if (values.image) {
      formData.append('image', values.image);
    } else if (editingGroup?.image) {
      formData.append('image_url', editingGroup.image);
    }
    if (editingGroup) {
      await updateGroupMutation.mutateAsync({ id: editingGroup.id, formData });
    } else {
      await createGroupMutation.mutateAsync(formData as never);
    }
    queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
  };

  const handleDeleteGroup = async (id: string) => {
    await deleteGroupMutation.mutateAsync(id);
    queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItemMutation.mutateAsync(id);
    queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
  };

  const handleItemModalClose = (success: boolean) => {
    setIsNewItemOpen(false);
    setEditingItem(null);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['catalog-groups'] });
      toast.success(editingItem ? "Item atualizado com sucesso!" : "Item criado com sucesso!");
    }
  };

  const handleOpenNewItemModal = () => {
    setEditingItem(null); 
    setIsNewItemOpen(true);
  };

  const handleOpenEditItemModal = (item: UICatalogItem) => {
    setEditingItem(item);
    setIsNewItemOpen(true);
  };

  return (
    <ProtectedRoute>
      <div className="w-full px-0 sm:px-4 lg:px-6">
      <Header 
        title="CATÁLOGO"
        description="Gerencie seu catálogo, estoque e disponibilidade dos itens"
      />
        
        <div className="flex-1 overflow-hidden bg-white">
          <div className="h-full overflow-y-auto">
            <div className="space-y-4">
              <div className="w-full">
                <ActionBar 
                    onNewGroup={() => {
                      setEditingGroup(null);
                      setIsNewGroupOpen(true);
                    }}
                    onNewItem={handleOpenNewItemModal}
                  />
                  
                  <NewItemModal 
                    isOpen={isNewItemOpen} 
                    onOpenChange={(open) => {
                      if (!open) {
                        handleItemModalClose(false);
                      }
                    }}
                    groups={groups}
                    editingItem={editingItem}
                    onDelete={handleDeleteItem}
                    onSave={async (formData) => {
                      try {
                        if (editingItem) {
                          await updateItemMutation.mutateAsync({ id: editingItem.id, formData });
                          handleItemModalClose(true);
                        } else {
                          await createItemMutation.mutateAsync(formData);
                          handleItemModalClose(true);
                        }
                      } catch (error) {
                        toast.error("Erro ao salvar item");
                      }
                    }}
                  />

                  <GroupModal
                    isOpen={isNewGroupOpen}
                    onOpenChange={(open) => {
                      if (!open) {
                        setIsNewGroupOpen(false);
                        setEditingGroup(null);
                      } else {
                        setIsNewGroupOpen(true);
                      }
                    }}
                    editingGroup={editingGroup}
                    onSave={handleSaveGroup}
                    onDelete={handleDeleteGroup}
                  />

                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-screen">
                      <p className="text-red-500">Erro ao carregar grupos</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...groups]
                        .sort((a, b) => b.priority - a.priority)
                        .map((group) => {
                          if (!group || !group.products) {
                            return null;
                          }
                          
                          return (
                            <ProductGroup 
                              key={group.id} 
                              group={group} 
                              onEdit={(group) => {
                                setEditingGroup(group);
                                setIsNewGroupOpen(true);
                              }}
                              onEditItem={handleOpenEditItemModal}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    </ProtectedRoute>
  );
}