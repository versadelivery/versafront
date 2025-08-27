import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Edit, Check, X } from "lucide-react";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useDestroyItems, useEditStep } from "../../../hooks/useCatalogGroup";

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
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [updateOptionName, setUpdateOptionName] = useState<string | null>(null)
  const { destroyStepItem, isDestroyingStepItem } = useDestroyItems(id, stepId, optionId)
  const { updateStepOption, isUpdatingStepOption } = useEditStep({ 
    id: id || '', 
    stepId: stepId || '', 
    optionId: optionId || '', 
    name: updateOptionName || value 
  })

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleUpdateStepOption = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (updateOptionName !== null) {
      updateStepOption();
      onChange({ target: { value: updateOptionName } } as React.ChangeEvent<HTMLInputElement>);
      setIsEditing(false);
    }
  }, [onChange, updateOptionName, updateStepOption]);

  const handleCancelEdit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setUpdateOptionName(value);
  }, [value]);

  const handleStartEdit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setUpdateOptionName(value);
    setIsEditing(true);
  }, [value]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    destroyStepItem();
    onRemove();
  }, [destroyStepItem, onRemove]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateOptionName(e.target.value);
    onChange(e);
  }, [onChange]);

  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-100">
      <span className="w-6 h-6 flex items-center justify-center mr-2">
        <Button variant="ghost" size="icon" onClick={handleStartEdit}>
          <Edit className="w-4 h-4" />
        </Button>
      </span>
      <Input
        ref={inputRef}
        type="text"
        value={updateOptionName || value}
        onChange={handleInputChange}
        disabled={!isEditing}
        placeholder={placeholder || "Ex: Mista"}
        className="flex-1 border-0 focus-visible:ring-0 bg-transparent outline-none text-base placeholder:text-gray-400"
      />
      {isEditing && (
        <>
          <button
            type="button"
            onClick={handleUpdateStepOption}
            className="cursor-pointer ml-2 text-blue-500 hover:text-blue-700 hover:bg-black/10 rounded-md p-2"
            disabled={isUpdatingStepOption}
          >
            {isUpdatingStepOption ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="cursor-pointer ml-2 text-gray-500 hover:text-gray-700 hover:bg-black/10 rounded-md p-2"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      )}
      <button
        type="button"
        onClick={handleRemove}
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
  const [updateStepId, setUpdateStepId] = useState<string | null>(null)
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const stepInputRef = useRef<HTMLInputElement>(null);
  const { destroyStep, isDestroyingStep } = useDestroyItems(id || '', stepId || '', '')
  const [stepName, setStepName] = useState<string | null>(null)
  const { updateStep, isUpdatingStep } = useEditStep({ 
    id: id || '', 
    stepId: updateStepId || '', 
    name: stepName || '' 
  })

  useEffect(() => {
    if (stepId) {
      destroyStep()
    }
  }, [stepId, destroyStep])

  useEffect(() => {
    if (editingStepIndex !== null && stepInputRef.current) {
      stepInputRef.current.focus();
    }
  }, [editingStepIndex]);

  const handleUpdateStep = useCallback((stepIndex: number) => {
    setEditingStepIndex(null);
  }, []);

  const handleRemoveStepOption = useCallback((stepIndex: number, optionIndex: number) => {
    const currentStep = steps[stepIndex];
    if (currentStep.options.length === 1) {
      onRemoveStep(stepIndex);
    } else {
      onRemoveStepOption(stepIndex, optionIndex);
    }
  }, [onRemoveStep, onRemoveStepOption, steps]);

  const handleStepChange = useCallback((stepIndex: number, value: string) => {
    onStepChange(stepIndex, 'name', value);
    setStepName(value);
  }, [onStepChange]);

  const handleRemoveStep = useCallback((stepIndex: number, stepId: string) => {
    setStepId(stepId);
    onRemoveStep(stepIndex);
  }, [onRemoveStep]);

  const renderStep = useCallback((step: Step, stepIndex: number) => (
    <div key={stepIndex} className="space-y-3 border border-gray-200 rounded-lg p-4 bg-muted/40">
      <div className="flex gap-2 items-start">
        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium text-gray-700">Nome da etapa</label>
          <div className="flex items-center gap-2">
            <Input
              ref={stepInputRef}
              placeholder="Ex: Primeira metade da pizza"
              value={step.name}
              disabled={editingStepIndex !== stepIndex}
              onChange={(e) => handleStepChange(stepIndex, e.target.value)}
              className="bg-white"
            />
            <>
              {editingStepIndex === stepIndex ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setUpdateStepId(step.id || '')
                    setStepName(step.name)
                    updateStep()
                  }}
                  disabled={isUpdatingStep}
                >
                  {isUpdatingStep ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingStepIndex(stepIndex)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => handleRemoveStep(stepIndex, step.id || '')}
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
              key={option.id}
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
  ), [editingStepIndex, handleRemoveStep, handleRemoveStepOption, handleStepChange, id, isDestroyingStep, isUpdatingStep, onAddStepOption, onStepOptionChange, updateStep]);

  const stepsList = useMemo(() => (
    <div className="space-y-4">
      {steps.map((step, stepIndex) => renderStep(step, stepIndex))}
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
  ), [onAddStep, renderStep, steps]);

  return stepsList;
} 