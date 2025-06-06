"use client"
import ProtectedRoute from "@/app/components/protected-route"
import { Header } from "../../components/catalog/catalog-header";
import { useState } from "react";
import GroupModal from "./group-modal-create";
import { NewItemModal } from "./item-modal";
import { ActionBar } from "@/app/admin/catalog/action-bar";
import { useCatalogGroup } from "./useCatalogGroup";
import { ItemCard } from "@/app/admin/catalog/item-card";
import { Edit2, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import GroupModalEdit from "./group-modal";

function CatalogPage() {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isGroupModalOpenEdit, setIsGroupModalOpenEdit] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const { isLoading, catalog } = useCatalogGroup();

  const handleEditGroup = (groupId: string) => {
    setEditingGroup(groupId);
    setIsGroupModalOpenEdit(true);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-full">
          <Header 
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
                <div key={group.id} className="flex flex-col gap-4 bg-accent p-6 rounded-xs">
                  <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">{group.attributes.name}</h2>
                  <Button 
                    variant="ghost" 
                    className="font-outfit rounded-xs py-3 px-6 flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 border-none shadow-none text-muted-foreground text-sm"
                    onClick={() => handleEditGroup(group.id)}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar</span>
                  </Button>

                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {group.attributes.items.map((item) => (
                      <div key={item.data.id} className="min-h-[400px]">
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
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </ProtectedRoute>
  )
}

export default CatalogPage