"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/protected-route";
import { Header } from "./components/catalog-header";
import { Tabs } from "./components/tabs";
import { ActionBar } from "./components/action-bar";
import { ProductGroup } from "./components/product-group";
import { GroupModal } from "./components/group-modal";
import { NewItemModal } from "./components/item-modal/new-item-modal";
import { CatalogTab, ProductGroup as ProductGroupType } from "@/app/types/admin";
import { StockContent } from "./components/stock-content";

const initialGroups: ProductGroupType[] = [
  {
    id: '1',
    name: 'Carnes',
    description: 'Cortes selecionados de carne bovina, suína e aves',
    priority: 1,
    products: [
      {
        id: '1',
        name: 'PICANHA',
        description: 'Picanha premium',
        price: 31.70,
        unit: 'Por unidade',
        active: true,
        image: '/img/picanha.jpg'
      },
      {
        id: '2',
        name: 'PEITO DE FRANGO',
        description: 'Peito de frango sem osso',
        price: 28.30,
        unit: 'Por peso',
        active: true,
        image: '/img/peito-de-frango.jpg'
      }
    ]
  },
  {
    id: '2',
    name: 'Bebidas',
    description: 'Refrigerantes, sucos e águas',
    priority: 2,
    products: [
      {
        id: '3',
        name: 'ÁGUA MINERAL',
        description: 'Garrafa 500ml',
        price: 3.50,
        unit: 'Unidade',
        active: true
      }
    ]
  }
];

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<CatalogTab>('catalog');
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroupType | null>(null);
  const [groups, setGroups] = useState<ProductGroupType[]>(initialGroups);

  const handleSaveGroup = (groupData: Omit<ProductGroupType, 'id' | 'products'>) => {
    if (editingGroup) {
      setGroups(groups.map(g => 
        g.id === editingGroup.id ? {...g, ...groupData} : g
      ));
    } else {
      const newGroup: ProductGroupType = {
        ...groupData,
        id: Date.now().toString(),
        products: []
      };
      setGroups([...groups, newGroup]);
    }
    setIsNewGroupOpen(false);
    setEditingGroup(null);
  };

  const handleEditGroup = (group: ProductGroupType) => {
    setEditingGroup(group);
    setIsNewGroupOpen(true);
  };

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
                onNewGroup={() => setIsNewGroupOpen(true)}
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
              />
              
              <div className="space-y-8">
                {groups
                  .sort((a, b) => a.priority - b.priority)
                  .map(group => (
                    <ProductGroup 
                      key={group.id} 
                      group={group} 
                      onEdit={handleEditGroup} 
                    />
                  ))}
              </div>
            </div>
          </main>
        </ProtectedRoute>
      ) : (
        <StockContent />
      )}
    </div>
  );
}