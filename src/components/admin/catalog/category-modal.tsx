"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCatalogCategories } from "@/hooks/useCatalogCategories";

export function CategoryModal({ open, onOpenChange, category }: { open: boolean; onOpenChange: (open: boolean) => void; category?: any | null }) {
  const { createCategory, updateCategory, isSaving } = useCatalogCategories();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setName(category?.attributes?.name ?? "");
    setDescription(category?.attributes?.description ?? "");
  }, [category, open]);

  const submit = () => {
    if (!name.trim()) return;
    const data = { name: name.trim(), description: description.trim() || undefined, priority: category?.attributes?.priority ?? 0 };
    if (category) updateCategory({ id: category.id, data });
    else createCategory(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{category ? "Editar categoria" : "Nova categoria"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da categoria" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição (opcional)" />
          <Button onClick={submit} disabled={!name.trim() || isSaving} className="w-full">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{category ? "Salvar categoria" : "Criar categoria"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
