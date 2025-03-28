"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/protected-route";
import { Header } from "./components/catalog-header";
import { Tabs } from "./components/tabs";
import { ActionBar } from "./components/action-bar";
import { ProductGroup } from "./components/product-group";
import { GroupModal } from "./components/group-modal";
import { NewItemModal } from "./components/item-modal/new-item-modal";
import { CatalogTab, CatalogGroup } from "@/app/types/admin";
import { StockContent } from "./components/stock-content";
import { getCatalogGroups, createCatalogGroup, updateCatalogGroup, deleteCatalogGroup } from "@/app/services/catalog-service";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<CatalogTab>('catalog');
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CatalogGroup | null>(null);
  const [groups, setGroups] = useState<CatalogGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCatalogGroups();
      setGroups(data);
      toast.success("Catálogo carregado com sucesso");
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
      setError("Falha ao carregar grupos. Tente novamente.");
      setGroups([]);
      toast.error("Falha ao carregar grupos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGroup = async (groupData: Omit<CatalogGroup, 'id'> & { imageFile?: File }) => {
    try {
      const formData = new FormData();
      formData.append('name', groupData.name);
      formData.append('description', groupData.description || '');
      formData.append('priority', groupData.priority.toString());

      if (groupData.imageFile) {
        formData.append('image', groupData.imageFile);
      } else if (groupData.image && typeof groupData.image === 'string') {
        formData.append('image_url', groupData.image);
      }

      if (editingGroup) {
        const updatedGroup = await updateCatalogGroup(editingGroup.id, formData);
        setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
        toast.success("Grupo atualizado com sucesso");
      } else {
        const newGroup = await createCatalogGroup(formData);
        setGroups([...groups, newGroup]);
        toast.success("Grupo criado com sucesso");
      }
      
      setIsNewGroupOpen(false);
      setEditingGroup(null);
    } catch (error) {
      console.error("Erro ao salvar grupo:", error);
      toast.error("Erro ao salvar grupo");
    }
  };

  const handleDeleteGroup = async (id: number): Promise<boolean> => {
    try {
      await deleteCatalogGroup(id);
      setGroups(groups.filter(g => g.id !== id));
      toast.success("Grupo deletado com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao deletar grupo:", error);
      toast.error("Falha ao deletar grupo");
      return false;
    }
  };

  const handleEditGroup = (group: CatalogGroup) => {
    setEditingGroup(group);
    setIsNewGroupOpen(true);
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
                onNewItem={() => setIsNewItemOpen(true)}
              />
              
              <NewItemModal isOpen={isNewItemOpen} setIsOpen={setIsNewItemOpen} />

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
                <div className="text-red-500 p-4 text-center">{error}</div>
              ) : (
                <div className="space-y-8">
                  {sortedGroups.map(group => (
                    <ProductGroup
                      key={group.id} 
                      group={group} 
                      onEdit={handleEditGroup}
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