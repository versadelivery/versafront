"use client";

import { useCatalogComplement } from "@/hooks/useCatalogComplement";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ComplementGroupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groupId?: string | null;
}

interface Option {
  id?: string;
  name: string;
  price: string;
  _destroy?: boolean;
}

export function ComplementGroupModal({ isOpen, onOpenChange, groupId }: ComplementGroupModalProps) {
  const { complementGroups, createComplementGroup, isCreating, updateComplementGroup, isUpdating } = useCatalogComplement();
  const [name, setName] = useState("");
  const [options, setOptions] = useState<Option[]>([{ name: "", price: "" }]);

  const isEditing = !!groupId;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen && groupId) {
      const group = complementGroups.find((g: any) => g.id === groupId);
      if (group) {
        setName(group.attributes.name);
        setOptions(group.attributes.options.map((o: any) => ({
          id: o.id,
          name: o.name,
          price: o.price.toFixed(2).replace('.', ',')
        })));
      }
    } else if (isOpen) {
      setName("");
      setOptions([{ name: "", price: "" }]);
    }
  }, [isOpen, groupId, complementGroups]);

  const handleAddOption = () => {
    setOptions([...options, { name: "", price: "" }]);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    if (newOptions[index].id) {
      newOptions[index]._destroy = true;
    } else {
      newOptions.splice(index, 1);
    }
    setOptions(newOptions);
  };

  const handleOptionChange = (index: number, field: "name" | "price", value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const formatPrice = (value: string) => {
    const numValue = value.replace(/\D/g, '');
    if (!numValue) return '';
    const floatValue = parseFloat(numValue) / 100;
    return floatValue.toFixed(2).replace('.', ',');
  };

  const handleSubmit = async () => {
    const data = {
      name,
      catalog_complement_options_attributes: options
        .filter(o => o.name.trim() !== '')
        .map(o => ({
          id: o.id,
          name: o.name,
          price: parseFloat(o.price.replace(',', '.')) || 0,
          _destroy: o._destroy
        }))
    };

    if (isEditing) {
      await updateComplementGroup({ id: groupId!, data });
    } else {
      await createComplementGroup(data);
    }
    onOpenChange(false);
  };

  const visibleOptions = options.filter(o => !o._destroy);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="font-tomato">{isEditing ? "Editar Lista" : "Nova Lista de Adicionais"}</DialogTitle>
          <DialogDescription>
            Configure o nome da lista e suas opções.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nome da Lista *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Adicionais de Hambúrguer"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Opções</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {visibleOptions.map((option, idx) => {
                const actualIdx = options.indexOf(option);
                return (
                  <div key={actualIdx} className="flex gap-2">
                    <Input
                      value={option.name}
                      onChange={(e) => handleOptionChange(actualIdx, "name", e.target.value)}
                      placeholder="Nome"
                      className="flex-[2]"
                    />
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                      <Input
                        value={option.price}
                        onChange={(e) => handleOptionChange(actualIdx, "price", formatPrice(e.target.value))}
                        placeholder="0,00"
                        className="pl-8"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(actualIdx)}
                      className="text-destructive h-9 w-9 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Salvar Alterações" : "Criar Lista"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
