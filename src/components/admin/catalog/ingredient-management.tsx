"use client";

import { useIngredient } from "@/hooks/useIngredient";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit2, Trash2, Egg, Loader2 } from "lucide-react";
import { useState } from "react";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { IngredientModal } from "./ingredient-modal";

export function IngredientManagement() {
  const { ingredients, isLoading, deleteIngredient, isDeleting, toggleStock } = useIngredient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [ingredientIdToDelete, setIngredientIdToDelete] = useState<string | null>(null);

  const handleEdit = (ingredient: any) => {
    setEditingIngredient(ingredient);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingIngredient(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setIngredientIdToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (ingredientIdToDelete) {
      await deleteIngredient(ingredientIdToDelete);
      setIsDeleteOpen(false);
      setIngredientIdToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando ingredientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-tomato text-lg font-semibold">Ingredientes / Insumos</h2>
          <p className="text-sm text-muted-foreground">
            Controle o estoque de ingredientes. Itens com ingrediente indisponível ficam visíveis mas não podem ser pedidos.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2 border border-gray-300 cursor-pointer">
          <Plus className="h-4 w-4" />
          Novo Ingrediente
        </Button>
      </div>

      {ingredients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-md border border-dashed border-[#E5E2DD]">
          <Egg className="h-10 w-10 text-muted-foreground" />
          <h3 className="font-tomato text-base font-semibold">Nenhum ingrediente cadastrado</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Cadastre ingredientes para controlar automaticamente a disponibilidade dos itens do cardápio.
          </p>
          <Button onClick={handleCreate} variant="outline" className="gap-2 border border-gray-300 cursor-pointer">
            <Plus className="h-4 w-4" />
            Criar Primeiro Ingrediente
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ingredients.map((ingredient: any) => {
            const itemsCount = ingredient.attributes.catalog_items_count || 0;
            const isOutOfStock = !ingredient.attributes.in_stock;

            return (
              <div
                key={ingredient.id}
                className={`bg-white p-4 rounded-md border transition-colors ${
                  isOutOfStock
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-[#E5E2DD] hover:border-primary/40"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-tomato font-semibold text-base truncate">
                      {ingredient.attributes.name}
                    </h3>
                    {isOutOfStock && (
                      <span className="bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                        SEM ESTOQUE
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => handleEdit(ingredient)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteClick(ingredient.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {itemsCount} {itemsCount === 1 ? "item vinculado" : "itens vinculados"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {ingredient.attributes.in_stock ? "Em estoque" : "Fora de estoque"}
                    </span>
                    <Switch
                      checked={ingredient.attributes.in_stock}
                      onCheckedChange={() => toggleStock(ingredient.id)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <IngredientModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        ingredient={editingIngredient}
      />

      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        type="ingrediente"
      />
    </div>
  );
}
