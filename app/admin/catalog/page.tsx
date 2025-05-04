"use client"
import ProtectedRoute from "@/app/components/protected-route"
import { Header } from "../../components/catalog/catalog-header";
import { useState, useEffect } from "react";
import GroupModal from "./group-modal";
import { NewItemModal } from "./item-modal";
import { ActionBar } from "@/app/admin/catalog/action-bar";
import { useCatalogGroup } from "./useCatalogGroup";
import { ItemCard } from "@/app/components/catalog/item-card";

interface CatalogResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      name: string;
      description: string;
      priority: number;
      image_url: string | null;
      items: {
        data: {
          id: string;
          type: string;
          attributes: {
            name: string;
            description: string;
            item_type: string;
            unit_of_measurement: string | null;
            price: number;
            price_with_discount: number | null;
            measure_interval: number | null;
            min_weight: number | null;
            max_weight: number | null;
            priority: number;
            image_url: string | null;
          };
        };
      }[];
    };
  }[];
}

function CatalogPage() {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const { getCatalog } = useCatalogGroup();

  useEffect(() => {
    console.log(getCatalog);
  }, [getCatalog]);

  return (
    <ProtectedRoute>
      <div className="w-full px-0 sm:px-4 lg:px-6 h-screen">
          <Header 
            title="CATÁLOGO"
            description="Gerencie seu catálogo, estoque e disponibilidade dos itens"
          />
          <ActionBar onNewGroup={() => setIsGroupModalOpen(true)} onNewItem={() => setIsItemModalOpen(true)} />
          <GroupModal isOpen={isGroupModalOpen} onOpenChange={setIsGroupModalOpen} />
          <NewItemModal isOpen={isItemModalOpen} onOpenChange={setIsItemModalOpen} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(getCatalog as unknown as CatalogResponse)?.data?.map((group) => (
              group.attributes.items.map((item) => (
                <ItemCard 
                  key={item.data.id} 
                  item={{
                    id: parseInt(item.data.id),
                    catalog_group_id: parseInt(group.id),
                    name: item.data.attributes.name,
                    description: item.data.attributes.description,
                    item_type: item.data.attributes.item_type,
                    unit_of_measurement: item.data.attributes.unit_of_measurement || undefined,
                    price: item.data.attributes.price,
                    price_with_discount: item.data.attributes.price_with_discount || undefined,
                    measure_interval: item.data.attributes.measure_interval || undefined,
                    min_weight: item.data.attributes.min_weight || undefined,
                    max_weight: item.data.attributes.max_weight || undefined,
                    image: item.data.attributes.image_url || undefined
                  }} 
                />
              ))
            ))}
          </div>
      </div>
    </ProtectedRoute>
  )
}

export default CatalogPage