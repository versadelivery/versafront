import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { PreparationMode } from "@/app/types/admin";

interface PreparationModesSectionProps {
  hasPreparationModes: boolean;
  setHasPreparationModes: (value: boolean) => void;
  preparationModes: PreparationMode[];
  addPreparationMode: () => void;
  removePreparationMode: (id: string) => void;
  updatePreparationMode: (id: string, value: string) => void;
}

export function PreparationModesSection({
  hasPreparationModes,
  setHasPreparationModes,
  preparationModes,
  addPreparationMode,
  removePreparationMode,
  updatePreparationMode
}: PreparationModesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Label className="text-sm sm:text-md font-bold">MODOS DE PREPARO?</Label>
        <Switch 
          checked={hasPreparationModes}
          onCheckedChange={setHasPreparationModes}
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-200"
        />
      </div>
      
      {hasPreparationModes && (
        <div className="space-y-4">
          <h3 className="text-sm sm:text-md font-bold">MODOS DE PREPARO</h3>
          
          {preparationModes.length > 0 && (
            <div className="space-y-3">
              {preparationModes.map((mode) => (
                <div key={mode.id} className="flex gap-3 items-center">
                  <Input
                    value={mode.description}
                    onChange={(e) => updatePreparationMode(mode.id, e.target.value)}
                    placeholder="Descrição do modo de preparo"
                    className="flex-1 py-6 text-base"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 text-red-500 hover:text-red-600"
                    onClick={() => removePreparationMode(mode.id)}
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
            onClick={addPreparationMode}
          >
            ADICIONAR
            <Plus className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}