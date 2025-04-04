import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Additional, PreparationMode, Step } from "@/app/types/admin";
import { useCreateItem, useUpdateItem } from "@/app/hooks/use-item";
import { useQueryClient } from "@tanstack/react-query";
import { FormValues, NewItemModalProps } from "@/app/types/catalog";

export const useNewItemModal = ({ isOpen, setIsOpen, onSuccess, editingItem, onDelete }: NewItemModalProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      item_type: 'unit'
    }
  });

  const [measureType, setMeasureType] = useState<'unit' | 'weight' | 'volume'>('unit');
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
  const [hasRemovedImage, setHasRemovedImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createItem, isPending: isCreating } = useCreateItem();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateItem();
  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'item_type' && value.item_type !== measureType) {
        setMeasureType(value.item_type as 'unit' | 'weight' | 'volume');
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, measureType]);

  useEffect(() => {
    if (editingItem) {
      const itemType = editingItem.attributes.item_type || 'unit';
      setMeasureType(itemType);
      reset({
        id: editingItem.id,
        name: editingItem.attributes.name,
        description: editingItem.attributes.description,
        catalog_group_id: editingItem.attributes.catalog_group_id,
        item_type: editingItem.attributes.item_type,
        price: editingItem.attributes.price,
        unit_of_measurement: editingItem.attributes.unit_of_measurement,
        measure_interval: editingItem.attributes.measure_interval,
        min_weight: editingItem.attributes.min_weight,
        max_weight: editingItem.attributes.max_weight,
        priority: editingItem.attributes.priority,
        price_with_discount: editingItem.attributes.price_with_discount,
      });
      setMeasureType(editingItem.attributes.item_type);
      setHasDiscount(!!editingItem.attributes.price_with_discount);
      
      if (editingItem.attributes.image_url) {
        setPreviewImage(editingItem.attributes.image_url);
      }
    } else {
      resetForm();
    }
  }, [editingItem, reset]);

  const resetForm = () => {
    setMeasureType('unit');
    reset({
      item_type: 'unit'
    });
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
    setHasRemovedImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    
    if (editingItem) {
      formData.append('id', editingItem.id);
    }
    
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('catalog_group_id', data.catalog_group_id);
    formData.append('item_type', data.item_type);
    formData.append('price', data.price);
    formData.append('priority', data.priority);
    
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (hasRemovedImage) {
      formData.append('image', '');
    }
    
    if (data.item_type === 'weight') {
      formData.append('unit_of_measurement', data.unit_of_measurement || 'kg');
      if (data.measure_interval) formData.append('measure_interval', data.measure_interval);
      if (data.min_weight) formData.append('min_weight', data.min_weight);
      if (data.max_weight) formData.append('max_weight', data.max_weight);
    }
    
    if (hasDiscount) {
      formData.append('price_with_discount', data.price_with_discount || '');
    } else if (editingItem) {
      formData.append('price_with_discount', '');
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
    
    if (editingItem) {
      await updateItem({ id: editingItem.id, formData }, {
        onSuccess: () => {
          setIsOpen(false);
          resetForm();
          if (onSuccess) onSuccess();
        }
      });
    } else {
      await createItem(formData, {
        onSuccess: () => {
          setIsOpen(false);
          resetForm();
          if (onSuccess) onSuccess();
        }
      });
    }
  };

  const handleImageChange = (file: File) => {
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
    setHasRemovedImage(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewImage(null);
    setHasRemovedImage(true);
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

  return {
    register,
    handleSubmit,
    errors,
    measureType,
    setMeasureType,
    hasDiscount,
    setHasDiscount,
    hasAdditionals,
    setHasAdditionals,
    additionals,
    setAdditionals,
    hasPreparationModes,
    setHasPreparationModes,
    preparationModes,
    setPreparationModes,
    hasSteps,
    setHasSteps,
    steps,
    setSteps,
    currentStepTitle,
    setCurrentStepTitle,
    previewImage,
    hasRemovedImage,
    fileInputRef,
    handleImageChange,
    handleRemoveImage,
    isSubmitting,
    modalActions,
    onSubmit,
    onDelete,
    setValue,
    watch,
    resetForm,
  };
};