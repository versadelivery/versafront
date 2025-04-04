"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/protected-route";
import { Header } from "./components/catalog-header";
import { Tabs } from "./components/tabs";
import { ActionBar } from "./components/action-bar";
import { ProductGroup } from "./components/product-group";
import { GroupModal } from "./components/group-modal";
import { NewItemModal } from "./components/item-modal/new-item-modal";
import { CatalogTab, UICatalogGroup, UICatalogItem } from "@/app/types/catalog";
import { StockContent } from "./components/stock-content";
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from "@/app/hooks/use-group";
import { useCreateItem, useDeleteItem, useUpdateItem } from "@/app/hooks/use-item";
import { Loader2 } from "lucide-react";
import { GroupFormValues } from "@/app/schemas/group-schema";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function CatalogPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CatalogTab>('catalog');
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UICatalogGroup | null>(null);
  const [editingItem, setEditingItem] = useState<UICatalogItem | null>(null);
  
  const { data: groups = [], isLoading, error } = useGroups();
  
  console.log("Groups data:", groups);
  
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
      <div className="w-full px-0 sm:px-8 lg:px-24">
      <Header 
        title={activeTab === 'catalog' ? 'CATÁLOGO' : 'ESTOQUE'}
        description={activeTab === 'catalog' 
          ? 'Gerencie seu catálogo, estoque e disponibilidade dos itens' 
          : 'Controle de matéria prima e insumos'}
      />
        
        <div className="flex-1 overflow-hidden bg-white">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="h-full overflow-y-auto">
            {activeTab === 'catalog' ? (
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
                    <div className="flex items-center justify-center h-32">
                      <p className="text-red-500">Erro ao carregar grupos</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...groups]
                        .sort((a, b) => b.priority - a.priority)
                        .map((group) => {
                          // Verificar a estrutura do grupo
                          console.log("Group in map:", group);
                          
                          // Garantir que o grupo tem a estrutura esperada
                          if (!group || !group.products) {
                            console.error("Grupo inválido:", group);
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
            ) : (
              <StockContent />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}