import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Additional } from "@/app/types/admin";

interface AdditionalsSectionProps {
  hasAdditionals: boolean;
  setHasAdditionals: (value: boolean) => void;
  additionals: Additional[];
  addAdditional: () => void;
  removeAdditional: (id: string) => void;
  updateAdditional: (id: string, field: keyof Additional, value: string) => void;
}

export function AdditionalsSection({
  hasAdditionals,
  setHasAdditionals,
  additionals,
  addAdditional,
  removeAdditional,
  updateAdditional
}: AdditionalsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Label className="text-sm sm:text-md font-bold">ADICIONAIS?</Label>
        <Switch 
          checked={hasAdditionals}
          onCheckedChange={setHasAdditionals}
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-200"
        />
      </div>
      
      {hasAdditionals && (
        <div className="space-y-4">
          <h3 className="text-sm sm:text-md font-bold">ADICIONAIS</h3>
          
          {additionals.length > 0 && (
            <div className="space-y-3">
              {additionals.map((additional) => (
                <div key={additional.id} className="flex gap-3 items-center">
                  <Input
                    value={additional.name}
                    onChange={(e) => updateAdditional(additional.id, 'name', e.target.value)}
                    placeholder="Nome do adicional"
                    className="flex-1 py-6 text-base"
                  />
                  <Input
                    value={additional.price}
                    onChange={(e) => updateAdditional(additional.id, 'price', e.target.value)}
                    placeholder="R$ 0,00"
                    className="w-32 py-6 text-base"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 text-red-500 hover:text-red-600"
                    onClick={() => removeAdditional(additional.id)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="py-4 font-regular text-sm bg-foreground/10 border-none rounded-sm"
            onClick={addAdditional}
          >
            ADICIONAR
            <Plus className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}