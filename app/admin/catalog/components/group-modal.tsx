import { ProductGroup } from "@/app/types/admin";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Camera } from "lucide-react";

interface GroupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingGroup: ProductGroup | null;
  onSave: (groupData: Omit<ProductGroup, 'id' | 'products'>) => void;
}

export function GroupModal({ isOpen, onOpenChange, editingGroup, onSave }: GroupModalProps) {
  const handleSave = () => {
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const description = (document.getElementById('description') as HTMLInputElement).value;
    const priority = parseInt((document.getElementById('priority') as HTMLInputElement).value);
    
    onSave({
      name,
      description,
      priority,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-7xl min-h-[500px] bg-white rounded-xs sm:min-h-[550px] lg:min-w-[720px] p-8 border-none">
        <DialogHeader>
          <DialogTitle className="flex gap-4 items-center text-xl sm:text-2xl font-semibold">
            {editingGroup ? 'Editar grupo' : 'Novo grupo'}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {editingGroup ? 'Atualize as informações do grupo' : 'Adicione um novo grupo ao seu catálogo'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 h-full flex flex-col">
          <div className="space-y-4 flex-1">
            <div>
              <label htmlFor="name" className="text-md sm:text-md font-bold text-foreground block mb-1 sm:mb-2">
                NOME DO GRUPO
              </label>
              <Input 
                id="name" 
                placeholder="Digite o nome do grupo" 
                className="py-6 text-base placeholder:text-foreground/40"
                defaultValue={editingGroup?.name || ''}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <div className="flex items-center gap-1 mb-1 sm:mb-2">
                  <label htmlFor="priority" className="text-md sm:text-md font-bold text-foreground">
                    PRIORIDADE DO GRUPO
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-foreground/60" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px] text-white bg-foreground">
                        <p>Prioridade determina a ordem em que os grupos aparecem no catálogo</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input 
                  id="priority" 
                  type="number" 
                  placeholder="0" 
                  min="0" 
                  max="100"
                  className="py-6 text-base placeholder:text-foreground/40"
                  defaultValue={editingGroup?.priority || 0}
                />
              </div>
              
              <div>
                <label htmlFor="image" className="text-md sm:text-md font-bold text-foreground block mb-1 sm:mb-2">
                  IMAGEM DO GRUPO
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-12 sm:h-14 border-2 border-gray-300 border-dashed rounded-xs cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                      <Camera className="w-5 h-5 text-foreground" />
                      <span className="text-xs sm:text-sm text-foreground/60 mt-1">Clique para adicionar imagem</span>
                    </div>
                    <Input id="image" type="file" className="hidden placeholder:text-foreground/40" />
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="text-md sm:text-md font-bold text-foreground block mb-1 sm:mb-2">
                DESCRIÇÃO
              </label>
              <Input 
                id="description" 
                placeholder="Digite a descrição do grupo" 
                className="py-6 text-base placeholder:text-foreground/40"
                defaultValue={editingGroup?.description || ''}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="border-none cursor-pointer bg-foreground/10 rounded-xs px-8 py-6 sm:px-10 sm:py-6 text-sm sm:text-base"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-primary hover:bg-primary/80 text-white border-none cursor-pointer rounded-xs px-8 py-6 sm:px-10 sm:py-6 text-sm sm:text-base"
            >
              {editingGroup ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}