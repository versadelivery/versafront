import { CatalogTab } from "@/app/types/admin";
import { Package, Utensils } from "lucide-react";
import React from "react";

interface TabsProps {
  activeTab: CatalogTab;
  setActiveTab: (tab: CatalogTab) => void;
}

export function Tabs({ activeTab, setActiveTab }: TabsProps) {
  return (
    <div className="w-full lg:max-w-[66.666%]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <TabButton 
          icon={<Utensils />}
          title="CATÁLOGO"
          description="Crie grupos, itens e complementos"
          isActive={activeTab === 'catalog'}
          onClick={() => setActiveTab('catalog')}
        />
        <TabButton 
          icon={<Package />}
          title="ESTOQUE"
          description="Controle de matéria prima e insumos"
          isActive={activeTab === 'stock'}
          onClick={() => setActiveTab('stock')}
        />
      </div>
    </div>
  );
}

interface TabButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ icon, title, description, isActive, onClick }: TabButtonProps) {
  return (
    <div 
      className={`p-4 sm:p-6 cursor-pointer rounded-xs ${isActive ? 'bg-primary text-white' : 'bg-[#212121]/10'}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`p-2 rounded-xs ${isActive ? 'bg-white' : 'bg-white'}`}>
          {React.cloneElement(icon as React.ReactElement, {
            className: `w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-primary' : 'text-gray-400'}`
          })}
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
          <p className={`text-xs sm:text-sm ${isActive ? 'opacity-90' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}