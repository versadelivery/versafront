"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Additional, PreparationMode, Step, NewItemModalProps } from "@/app/types/admin";
import { BasicInfoSection } from "./basic-info-section";
import { MeasurePriceSection } from "./measure-price-section";
import { AdditionalsSection } from "./additionals-section";
import { PreparationModesSection } from "./preparation-modes-section";
import { StepsSection } from "./steps-section";

export function NewItemModal({ isOpen, setIsOpen }: NewItemModalProps) {
  const [measureType, setMeasureType] = useState<'unit' | 'weight'>('unit');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountValue, setDiscountValue] = useState('');
  const [hasAdditionals, setHasAdditionals] = useState(false);
  const [additionals, setAdditionals] = useState<Additional[]>([]);
  const [hasPreparationModes, setHasPreparationModes] = useState(false);
  const [preparationModes, setPreparationModes] = useState<PreparationMode[]>([]);
  const [hasSteps, setHasSteps] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepTitle, setCurrentStepTitle] = useState('');

  const modalActions = {
    addAdditional: () => {
      setAdditionals([...additionals, { id: Date.now().toString(), name: '', price: '' }]);
    },
    removeAdditional: (id: string) => {
      setAdditionals(additionals.filter(item => item.id !== id));
    },
    updateAdditional: (id: string, field: keyof Additional, value: string) => {
      setAdditionals(additionals.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ));
    },
    addPreparationMode: () => {
      setPreparationModes([...preparationModes, { id: Date.now().toString(), description: '' }]);
    },
    removePreparationMode: (id: string) => {
      setPreparationModes(preparationModes.filter(item => item.id !== id));
    },
    updatePreparationMode: (id: string, value: string) => {
      setPreparationModes(preparationModes.map(item => 
        item.id === id ? { ...item, description: value } : item
      ));
    },
    addStep: () => {
      if (currentStepTitle.trim()) {
        setSteps([...steps, { 
          id: Date.now().toString(), 
          title: currentStepTitle, 
          items: [] 
        }]);
        setCurrentStepTitle('');
      }
    },
    addStepItem: (stepId: string) => {
      setSteps(steps.map(step => 
        step.id === stepId 
          ? { ...step, items: [...step.items, { id: Date.now().toString(), name: '' }] } 
          : step
      ));
    },
    removeStepItem: (stepId: string, itemId: string) => {
      setSteps(steps.map(step => 
        step.id === stepId 
          ? { ...step, items: step.items.filter(item => item.id !== itemId) } 
          : step
      ));
    },
    updateStepItem: (stepId: string, itemId: string, value: string) => {
      setSteps(steps.map(step => 
        step.id === stepId 
          ? { 
              ...step, 
              items: step.items.map(item => 
                item.id === itemId ? { ...item, name: value } : item
              ) 
            } 
          : step
      ));
    },
    removeStep: (stepId: string) => {
      setSteps(steps.filter(step => step.id !== stepId));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="border-none w-[100vw] max-h-screen max-w-7xl sm:max-h-[90vh] bg-white rounded-xs lg:min-w-[820px] p-8 overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl sm:text-2xl font-semibold">
              NOVO ITEM
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-8 py-2">
          <BasicInfoSection />
          
          <div className="border-t border-gray-200 pt-6"></div>
          
          <MeasurePriceSection 
            measureType={measureType}
            setMeasureType={setMeasureType}
            hasDiscount={hasDiscount}
            setHasDiscount={setHasDiscount}
            discountValue={discountValue}
            setDiscountValue={setDiscountValue}
          />
          
          <div className="border-t border-gray-200 pt-6"></div>
          
          <AdditionalsSection 
            hasAdditionals={hasAdditionals}
            setHasAdditionals={setHasAdditionals}
            additionals={additionals}
            {...modalActions}
          />
          
          <div className="border-t border-gray-200 pt-6"></div>
          
          <PreparationModesSection
            hasPreparationModes={hasPreparationModes}
            setHasPreparationModes={setHasPreparationModes}
            preparationModes={preparationModes}
            {...modalActions}
          />
          
          <div className="border-t border-gray-200 pt-6"></div>
          
          <StepsSection
            hasSteps={hasSteps}
            setHasSteps={setHasSteps}
            steps={steps}
            currentStepTitle={currentStepTitle}
            setCurrentStepTitle={setCurrentStepTitle}
            {...modalActions}
          />
          
          <Button 
            className="w-full py-6 bg-primary hover:bg-primary/80 text-white text-base"
          >
            SALVAR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}