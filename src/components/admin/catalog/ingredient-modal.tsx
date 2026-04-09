"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useIngredient } from "@/hooks/useIngredient";

interface IngredientModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient?: { id: string; attributes: { name: string; in_stock: boolean } } | null;
}

export function IngredientModal({ isOpen, onOpenChange, ingredient }: IngredientModalProps) {
  const { createIngredient, isCreating, updateIngredient, isUpdating } = useIngredient();
  const [name, setName] = useState("");
  const [inStock, setInStock] = useState(true);
  const [error, setError] = useState("");

  const isEditing = !!ingredient;
  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      if (ingredient) {
        setName(ingredient.attributes.name);
        setInStock(ingredient.attributes.in_stock);
      } else {
        setName("");
        setInStock(true);
      }
      setError("");
    }
  }, [isOpen, ingredient]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    const data = { name: name.trim(), in_stock: inStock };

    if (isEditing && ingredient) {
      updateIngredient(
        { id: ingredient.id, data },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createIngredient(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-tomato">
            {isEditing ? "Editar Ingrediente" : "Novo Ingrediente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize o nome ou status do ingrediente."
              : "Adicione um novo ingrediente/insumo para controlar disponibilidade dos itens."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Ex: Tomate, Queijo, Bacon..."
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Em estoque</p>
              <p className="text-xs text-muted-foreground">
                {inStock
                  ? "Ingrediente disponível"
                  : "Itens com este ingrediente ficarão indisponíveis"}
              </p>
            </div>
            <Switch checked={inStock} onCheckedChange={setInStock} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
