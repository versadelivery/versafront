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
import { useDeleteItem } from "@/app/hooks/use-item";
import { Loader2 } from "lucide-react";
import { GroupFormValues } from "@/app/schemas/group-schema";

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<CatalogTab>('catalog');
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UICatalogGroup | null>(null);
  const [editingItem, setEditingItem] = useState<UICatalogItem | null>(null);
  
  const { data: groups = [], isLoading, error } = useGroups();
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();
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
  };

  const handleItemModalClose = (success: boolean) => {
    setIsNewItemOpen(false);
    setEditingItem(null);
  };

  const handleDeleteGroup = async (id: string) => {
    await deleteGroupMutation.mutateAsync(id);
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItemMutation.mutateAsync(id);
  };

  const handleEditGroup = (group: UICatalogGroup) => {
    setEditingGroup(group);
    setIsNewGroupOpen(true);
  };

  const handleEditItem = (item: UICatalogItem) => {
    setEditingItem(item);
    setIsNewItemOpen(true);
  };

  const sortedGroups = [...groups].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return (
    <div className="w-full px-4 sm:px-8 lg:px-24">
      <Header 
        title={activeTab === 'catalog' ? 'CATÁLOGO' : 'ESTOQUE'}
        description={activeTab === 'catalog' 
          ? 'Gerencie seu catálogo, estoque e disponibilidade dos itens' 
          : 'Controle de matéria prima e insumos'}
      />

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'catalog' ? (
        <ProtectedRoute>
          <main className="min-h-screen bg-white">
            <div className="w-full">
              <ActionBar 
                onNewGroup={() => {
                  setEditingGroup(null);
                  setIsNewGroupOpen(true);
                }}
                onNewItem={() => {
                  setEditingItem(null);
                  setIsNewItemOpen(true);
                }}
              />
              
              <NewItemModal 
                isOpen={isNewItemOpen} 
                setIsOpen={(open) => {
                  if (!open) handleItemModalClose(false);
                  else setIsNewItemOpen(true);
                }} 
                onSuccess={() => handleItemModalClose(true)}
                editingItem={editingItem}
                onDelete={handleDeleteItem}
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
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-red-500 p-4 text-center">Falha ao carregar grupos</div>
              ) : (
                <div className="space-y-8">
                  {sortedGroups.map(group => (
                    <ProductGroup
                      key={group.id} 
                      group={group} 
                      onEdit={handleEditGroup}
                      onEditItem={handleEditItem}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </ProtectedRoute>
      ) : (
        <StockContent />
      )}
    </div>
  );
}