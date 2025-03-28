import { Filter, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ActionBarProps {
  onNewGroup: () => void;
  onNewItem: () => void;
}

export function ActionBar({ onNewGroup, onNewItem }: ActionBarProps) {
  return (
    <div className="flex flex-col gap-3 mb-6 lg:gap-2 lg:mb-8 lg:flex-row">
      <div className="relative w-full lg:flex-1">
        <div className="relative flex items-center bg-[#212121]/10 rounded-xs h-full px-8">
          <Search className="absolute left-8 w-4 h-4 lg:w-5 lg:h-5 text-[#212121]/70" />
          <Input 
            placeholder="Buscar itens..." 
            className="py-6 pl-10 pr-4 bg-transparent border-none shadow-none placeholder:text-[#212121]/70 focus-visible:ring-0 w-full text-sm lg:text-base lg:py-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full lg:flex lg:gap-2 lg:w-auto">
        <Button 
          variant="ghost" 
          className="rounded-xs cursor-pointer py-6 flex items-center justify-center gap-2 bg-[#212121]/10 hover:bg-[#212121]/20 border-none shadow-none text-[#212121]/70 text-sm lg:py-8 lg:flex-1"
        >
          <Filter className="w-4 h-4" />
          <span className="whitespace-nowrap">Todas categorias</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="rounded-xs cursor-pointer py-6 flex items-center justify-center gap-2 bg-[#212121]/10 hover:bg-[#212121]/20 border-none shadow-none text-[#212121]/70 text-sm lg:py-8 lg:flex-1"
          onClick={onNewGroup}
        >
          <Plus className="w-4 h-4" />
          <span>Novo grupo</span>
        </Button>

        <Button 
          className="rounded-xs cursor-pointer col-span-2 py-6 bg-primary hover:bg-primary/80 text-white flex items-center justify-center gap-2 text-sm lg:col-auto lg:py-8 lg:flex-1"
          onClick={onNewItem}
        >
          <Plus className="w-4 h-4" />
          <span>Novo item</span>
        </Button>
      </div>
    </div>
  );
}