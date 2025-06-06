import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDestroyItems } from "../../../app/admin/catalog/useCatalogGroup";

interface StepOptionInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  placeholder?: string;
  id: string;
  stepId: string;
  optionId: string;
}

function StepOptionInput({ value, onChange, onRemove, placeholder, id, stepId, optionId }: StepOptionInputProps) {
  const { destroyStepItem, isDestroyingStepItem } = useDestroyItems(id, stepId, optionId)

  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-100">
      <span className="w-6 h-6 flex items-center justify-center mr-2">
        <span className="w-1 h-1 rounded-full border-2 border-gray-400 block" />
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Ex: Mista"}
        className="flex-1 border-0 focus-visible:ring-0 bg-transparent outline-none text-base placeholder:text-gray-400"
      />
      <button
        type="button"
        onClick={() => {
          destroyStepItem()
          onRemove()
        }}
        className="cursor-pointer ml-2 text-red-500 hover:text-red-700 hover:bg-balck/10 rounded-md p-2"
        tabIndex={-1}
      >
        {isDestroyingStepItem ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}



interface Step {
  name: string;
  options: { name: string; id?: string }[];
  id?: string;
}

interface ItemStepsProps {
  steps: Step[];
  onStepChange: (stepIndex: number, field: keyof Step, value: string) => void;
  onRemoveStep: (stepIndex: number) => void;
  onAddStep: () => void;
  onStepOptionChange: (stepIndex: number, optionIndex: number, value: string) => void;
  onAddStepOption: (stepIndex: number) => void;
  onRemoveStepOption: (stepIndex: number, optionIndex: number) => void;
  id?: string;
}

export function ItemSteps({
  steps,
  onStepChange,
  onRemoveStep,
  onAddStep,
  onStepOptionChange,
  onAddStepOption,
  onRemoveStepOption,
  id, 
}: ItemStepsProps) {
  const [stepId, setStepId] = useState<string | null>(null)
  const { destroyStep, isDestroyingStep } = useDestroyItems(id || '', stepId || '', '')

  useEffect(() => {
    if (stepId) {
      destroyStep()
    }
  }, [stepId])

  const handleRemoveStepOption = (stepIndex: number, optionIndex: number) => {
    const currentStep = steps[stepIndex];
    if (currentStep.options.length === 1) {
      onRemoveStep(stepIndex);
    } else {
      onRemoveStepOption(stepIndex, optionIndex);
    }
  };

  return (
    <div className="space-y-4">
      {steps.map((step, stepIndex) => (
        <div key={stepIndex} className="space-y-3 border border-gray-200 rounded-lg p-4 bg-muted/40">
          <div className="flex gap-2 items-start">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-gray-700">Nome da etapa</label>
              <Input
                placeholder="Ex: Primeira metade da pizza"
                value={step.name}
                onChange={(e) => onStepChange(stepIndex, 'name', e.target.value)}
                className="bg-white"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setStepId(step.id || '')
                onRemoveStep(stepIndex)
              }}
              className="cursor-pointer shrink-0 text-gray-500 hover:text-red-500"
            >
              {isDestroyingStep ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="space-y-3 pl-4 border-l-2 border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-600">Itens desta etapa</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAddStepOption(stepIndex)}
                className="text-xs"
              >
                Novo item
              </Button>
            </div>
            <div className="space-y-2">
              {step.options.map((option, optionIndex) => (
                <StepOptionInput
                  key={optionIndex}
                  value={option.name}
                  onChange={(e) => onStepOptionChange(stepIndex, optionIndex, e.target.value)}
                  onRemove={() => handleRemoveStepOption(stepIndex, optionIndex)}
                  optionId={option.id as never}
                  stepId={step.id as never}
                  id={id as never}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={onAddStep}
        className="w-full border-dashed"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nova etapa
      </Button>
    </div>
  );
} 