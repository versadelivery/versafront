"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Additional, PreparationMode, Step, NewItemModalProps } from "@/app/types/admin";
import { BasicInfoSection } from "./basic-info-section";
import { MeasurePriceSection } from "./measure-price-section";
import { AdditionalsSection } from "./additionals-section";
import { PreparationModesSection } from "./preparation-modes-section";
import { StepsSection } from "./steps-section";
import { useCreateItem } from "@/app/hooks/use-item";

interface FormValues {
  name: string;
  description: string;
  catalog_group_id: string;
  item_type: 'unit' | 'weight';
  price: string;
  unit_of_measurement?: 'kg' | 'g';
  measure_interval?: string;
  min_weight?: string;
  max_weight?: string;
  priority: string;
  price_with_discount?: string;
}

export function NewItemModal({ isOpen, setIsOpen, onSuccess, editingItem, onDelete  }: NewItemModalProps) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      item_type: 'unit'
    }
  });

  const [measureType, setMeasureType] = useState<'unit' | 'weight'>('unit');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [hasAdditionals, setHasAdditionals] = useState(false);
  const [additionals, setAdditionals] = useState<Additional[]>([]);
  const [hasPreparationModes, setHasPreparationModes] = useState(false);
  const [preparationModes, setPreparationModes] = useState<PreparationMode[]>([]);
  const [hasSteps, setHasSteps] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepTitle, setCurrentStepTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createItem, isPending: isSubmitting } = useCreateItem();

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('catalog_group_id', data.catalog_group_id);
    formData.append('item_type', data.item_type);
    formData.append('price', data.price);
    formData.append('priority', data.priority);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    if (data.item_type === 'weight') {
      formData.append('unit_of_measurement', data.unit_of_measurement || 'kg');
      if (data.measure_interval) formData.append('measure_interval', data.measure_interval);
      if (data.min_weight) formData.append('min_weight', data.min_weight);
      if (data.max_weight) formData.append('max_weight', data.max_weight);
    }
    
    if (hasDiscount && data.price_with_discount) {
      formData.append('price_with_discount', data.price_with_discount);
    }
    
    if (hasAdditionals && additionals.length > 0) {
      additionals.forEach((additional, index) => {
        formData.append(`catalog_item_extras_attributes[${index}][name]`, additional.name);
        formData.append(`catalog_item_extras_attributes[${index}][price]`, additional.price);
      });
    }
    
    if (hasPreparationModes && preparationModes.length > 0) {
      preparationModes.forEach((mode, index) => {
        formData.append(`catalog_item_prepare_methods_attributes[${index}][name]`, mode.description);
      });
    }
    
    if (hasSteps && steps.length > 0) {
      steps.forEach((step, stepIndex) => {
        formData.append(`catalog_item_steps_attributes[${stepIndex}][name]`, step.title);
        step.items.forEach((item, itemIndex) => {
          formData.append(`catalog_item_steps_attributes[${stepIndex}][catalog_item_step_options_attributes][${itemIndex}][name]`, item.name);
        });
      });
    }
    
    createItem(formData, {
      onSuccess: () => {
        setIsOpen(false);
        resetForm();
        if (onSuccess) onSuccess();
      }
    });
  };

  const resetForm = () => {
    reset({
      item_type: 'unit'
    });
    setMeasureType('unit');
    setHasDiscount(false);
    setHasAdditionals(false);
    setAdditionals([]);
    setHasPreparationModes(false);
    setPreparationModes([]);
    setHasSteps(false);
    setSteps([]);
    setCurrentStepTitle('');
    setImageFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setIsOpen(false);
        resetForm();
      }
    }}>
      <DialogContent className="border-none w-[100vw] max-h-screen max-w-7xl sm:max-h-[90vh] bg-white rounded-xs lg:min-w-[820px] p-8 overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl sm:text-2xl font-semibold">
              NOVO ITEM
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-8 py-2">
            <BasicInfoSection 
              register={register} 
              errors={errors} 
              setDefaultGroupId={(id) => setValue('catalog_group_id', id)}
              setImageFile={setImageFile}
              previewImage={previewImage}
              onImageChange={handleImageChange}
              onRemoveImage={removeImage}
            />
            
            <div className="border-t border-gray-200 pt-6"></div>
            
            <MeasurePriceSection 
              measureType={measureType}
              setMeasureType={(type) => {
                setMeasureType(type);
                setValue('item_type', type);
              }}
              hasDiscount={hasDiscount}
              setHasDiscount={setHasDiscount}
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
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
              type="submit"
              className="w-full py-6 bg-primary hover:bg-primary/80 text-white text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'SALVANDO...' : 'SALVAR'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}