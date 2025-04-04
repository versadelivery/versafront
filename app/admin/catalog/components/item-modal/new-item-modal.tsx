"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BasicInfoSection } from "./basic-info-section";
import { MeasurePriceSection } from "./measure-price-section";
import { AdditionalsSection } from "./additionals-section";
import { PreparationModesSection } from "./preparation-modes-section";
import { StepsSection } from "./steps-section";
import { useNewItemModal } from "@/app/hooks/use-new-item-modal";
import { NewItemModalProps } from "@/app/types/catalog";
import { DeleteConfirmation } from "../delete-confirmation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function NewItemModal(props: NewItemModalProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {
    register,
    handleSubmit,
    errors,
    measureType,
    hasDiscount,
    setHasDiscount,
    hasAdditionals,
    additionals,
    hasPreparationModes,
    preparationModes,
    hasSteps,
    steps,
    currentStepTitle,
    previewImage,
    isSubmitting,
    fileInputRef,
    modalActions,
    onSubmit,
    handleImageChange,
    handleRemoveImage,
    setCurrentStepTitle,
    setHasAdditionals,
    setHasPreparationModes,
    setHasSteps,
    setValue,
    watch,
    resetForm,
    hasRemovedImage,
  } = useNewItemModal(props);

  const { isOpen, setIsOpen, editingItem, onDelete } = props;

  const handleDelete = async () => {
    if (!editingItem?.id || !onDelete) return;
    
    try {
      await onDelete(editingItem.id);
      setIsOpen(false);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erro ao deletar item:", error);
    }
  };

  return (
    <>
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
                {editingItem ? 'EDITAR ITEM' : 'NOVO ITEM'}
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8 py-2">
              <BasicInfoSection 
                register={register} 
                errors={errors} 
                setDefaultGroupId={(id) => setValue('catalog_group_id', id)}
                previewImage={previewImage}
                onImageChange={handleImageChange}
                onRemoveImage={handleRemoveImage}
                hasRemovedImage={hasRemovedImage}
              />
              
              <div className="border-t border-gray-200 pt-6"></div>
              
              <MeasurePriceSection 
                measureType={measureType}
                setMeasureType={(type) => {
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
              
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 mt-4">
                <div className="flex gap-2 w-full sm:w-auto">
                  {editingItem && onDelete && (
                    <Button 
                      variant="destructive" 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="rounded-xs gap-2 bg-red-500 hover:bg-red-600 w-full sm:w-auto"
                      disabled={isSubmitting}
                      size="lg"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Deletar</span>
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setIsOpen(false)} 
                    className="rounded-xs border-none bg-foreground/10 w-full sm:w-auto"
                    disabled={isSubmitting}
                    size="lg"
                    type="button"
                  >
                    Cancelar
                  </Button>
                </div>
                
                <Button 
                  type="submit"
                  className="rounded-xs bg-primary hover:bg-primary/80 text-white border-none w-full sm:w-auto"
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? 'SALVANDO...' : 'SALVAR'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
        type="Item"
      />
    </>
  );
}