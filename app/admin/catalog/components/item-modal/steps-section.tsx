import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Step } from "@/app/types/admin";

interface StepsSectionProps {
  hasSteps: boolean;
  setHasSteps: (value: boolean) => void;
  steps: Step[];
  currentStepTitle: string;
  setCurrentStepTitle: (value: string) => void;
  addStep: () => void;
  addStepItem: (stepId: string) => void;
  removeStepItem: (stepId: string, itemId: string) => void;
  updateStepItem: (stepId: string, itemId: string, value: string) => void;
  removeStep: (stepId: string) => void;
}

export function StepsSection({
  hasSteps,
  setHasSteps,
  steps,
  currentStepTitle,
  setCurrentStepTitle,
  addStep,
  addStepItem,
  removeStepItem,
  updateStepItem,
  removeStep
}: StepsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-sm sm:text-md font-bold">ITEM POR ETAPAS?</Label>
        <Switch 
          checked={hasSteps}
          onCheckedChange={setHasSteps}
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-200"
        />
      </div>
      
      {hasSteps && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <Input
              value={currentStepTitle}
              onChange={(e) => setCurrentStepTitle(e.target.value)}
              placeholder="Título da etapa (ex: Primeira metade da pizza)"
              className="flex-1 py-6 text-base"
            />
            <Button 
              variant="outline" 
              className="py-6 text-base whitespace-nowrap"
              onClick={addStep}
            >
              ADICIONAR ETAPA
            </Button>
          </div>
          
          {steps.length > 0 && (
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.id} className="space-y-3 border border-gray-200 rounded-xs p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{step.title}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => removeStep(step.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {step.items.length > 0 && (
                    <div className="space-y-2">
                      {step.items.map((item) => (
                        <div key={item.id} className="flex gap-3 items-center">
                          <div className="w-5 h-5 rounded-xsll border-2 border-gray-300 flex-shrink-0" />
                          <Input
                            value={item.name}
                            onChange={(e) => updateStepItem(step.id, item.id, e.target.value)}
                            placeholder="Nome do item"
                            className="flex-1 py-6 text-base"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 text-red-500 hover:text-red-600"
                            onClick={() => removeStepItem(step.id, item.id)}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="py-6 text-base w-full"
                    onClick={() => addStepItem(step.id)}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    ADICIONAR ITEM A ETAPA
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}