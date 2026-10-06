"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useCatalogCategories } from "@/hooks/useCatalogCategories";
import { getApiErrorMessage } from "@/utils/api-error";
import { ALL_WEEKDAYS, WEEKDAYS, WeekdayPicker, WeekdayState, weekdaysFrom } from "./weekday-picker";

export function CategoryModal({ open, onOpenChange, category }: { open: boolean; onOpenChange: (open: boolean) => void; category?: any | null }) {
  const { createCategory, updateCategory, isSaving } = useCatalogCategories();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [days, setDays] = useState<WeekdayState>(ALL_WEEKDAYS);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(category?.attributes?.name ?? "");
    setDescription(category?.attributes?.description ?? "");
    setActive(category?.attributes?.active ?? true);
    setDays(weekdaysFrom(category?.attributes));
    setError("");
  }, [category, open]);

  const submit = () => {
    if (!name.trim()) return;
    if (!WEEKDAYS.some(({ key }) => days[key])) {
      setError("Selecione pelo menos um dia da semana");
      return;
    }

    setError("");
    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      priority: category?.attributes?.priority ?? 0,
      active,
      ...days,
    };
    const callbacks = {
      onSuccess: () => onOpenChange(false),
      onError: (e: unknown) => setError(getApiErrorMessage(e, "Não foi possível salvar a categoria")),
    };

    if (category) updateCategory({ id: category.id, data }, callbacks);
    else createCategory(data, callbacks);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{category ? "Editar categoria" : "Nova categoria"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da categoria" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição (opcional)" />

          <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
            <div>
              <p className="text-sm font-medium">Categoria ativa</p>
              <p className="text-xs text-muted-foreground">Desativada, a categoria e seus grupos somem do cardápio</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} aria-label="Categoria ativa" />
          </div>

          <WeekdayPicker value={days} onChange={(next) => { setDays(next); setError(""); }} />
          <p className="text-xs text-muted-foreground">Ex.: carnes bovinas só aos sábados — deixe marcado apenas Sáb.</p>

          {error && (
            <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button onClick={submit} disabled={!name.trim() || isSaving} className="w-full">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{category ? "Salvar categoria" : "Criar categoria"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
