import { Filter, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ActionBarProps {
  onNewGroup: () => void;
  onNewItem: () => void;
  hasGroups?: boolean;
}

export function ActionBar({ onNewGroup, onNewItem, hasGroups = true }: ActionBarProps) {
  return (
    <div className="flex flex-col gap-4 mb-6 lg:gap-3 lg:flex-row">
      <div className="relative w-full lg:flex-1">
        <div className="relative flex items-center bg-muted rounded-lg h-full px-8 opacity-60">
          <Search className="absolute left-4 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar itens..." 
            className="rounded-lg font-outfit py-3 pl-10 pr-4 bg-transparent border-none shadow-none placeholder:text-muted-foreground focus-visible:ring-0 w-full text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full lg:flex lg:gap-3 lg:w-auto">
        <Button 
          variant="ghost" 
          className="font-outfit rounded-lg py-3 px-4 flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 border-none shadow-none text-muted-foreground text-sm lg:flex-1 opacity-60"
        >
          <Filter className="w-4 h-4" />
          <span className="whitespace-nowrap">Grupos</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="font-outfit rounded-lg py-3 px-4 flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 border-none shadow-none text-muted-foreground text-sm lg:flex-1"
          onClick={onNewGroup}
        >
          <Plus className="w-4 h-4" />
          <span>Novo grupo</span>
        </Button>

        <Button
          className="font-outfit rounded-lg cursor-pointer col-span-2 py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 text-sm lg:col-auto lg:flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNewItem}
          disabled={!hasGroups}
        >
          <Plus className="w-4 h-4" />
          <span>Novo item</span>
        </Button>
      </div>
    </div>
  );
}