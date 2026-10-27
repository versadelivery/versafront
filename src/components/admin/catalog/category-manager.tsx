"use client";

import { useState } from "react";
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit2, GripVertical, Plus, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { useCatalogCategories } from "@/hooks/useCatalogCategories";
import { getApiErrorMessage } from "@/utils/api-error";
import { weekdaysSummary } from "./weekday-picker";

interface CategoryManagerProps {
  onCreate: () => void;
  onEdit: (category: any) => void;
}

function CategoryRow({ category, position, onEdit, onDelete, onToggle }: {
  category: any;
  position: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (active: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });
  const inactive = category.attributes.active === false;
  const days = weekdaysSummary(category.attributes);
  const name = category.attributes.name;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-md border bg-white px-2 py-2 sm:px-3 ${isDragging ? "relative z-10 border-primary shadow-md" : "border-[#E5E2DD] hover:border-primary/40"}`}
    >
      <button
        type="button"
        className="flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-[#FAF9F7] hover:text-gray-900 active:cursor-grabbing"
        aria-label={`Arrastar para reordenar ${name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-semibold text-primary">
        {position}
      </span>

      <div className={`min-w-0 flex-1 ${inactive ? "opacity-60" : ""}`}>
        <p className="truncate text-sm font-medium text-gray-900">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {inactive ? "Inativa: oculta no cardápio" : days ? `Somente: ${days}` : "Todos os dias"}
        </p>
      </div>

      <Switch
        className="cursor-pointer"
        checked={!inactive}
        onCheckedChange={onToggle}
        aria-label={`Ativar ou desativar ${name}`}
      />
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={onEdit} aria-label={`Editar ${name}`} title="Editar">
        <Edit2 className="h-4 w-4 text-muted-foreground" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 cursor-pointer hover:bg-red-50" onClick={onDelete} aria-label={`Remover ${name}`} title="Remover">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export function CategoryManager({ onCreate, onEdit }: CategoryManagerProps) {
  const { categories, updateCategory, deleteCategory, reorderCategories } = useCatalogCategories();
  const [toDelete, setToDelete] = useState<any | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = categories.map((category: any) => category.id);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    reorderCategories(arrayMove(ids, from, to));
  };

  return (
    <div className="mb-4 rounded-md border border-[#E5E2DD] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
            <Tags className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-tomato text-sm font-semibold text-gray-900">Categorias</p>
            <p className="text-xs text-muted-foreground">Arraste pelo ícone <GripVertical className="inline h-3 w-3" /> para definir a ordem em que aparecem na loja.</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="cursor-pointer gap-2" onClick={onCreate}>
          <Plus className="h-4 w-4" /> Nova categoria
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="mt-3 rounded-md border border-dashed border-[#E5E2DD] bg-[#FAF9F7] px-4 py-6 text-center">
          <p className="text-sm font-medium text-gray-900">Nenhuma categoria ainda</p>
          <p className="mt-1 text-xs text-muted-foreground">Crie categorias como Churrasco ou Bebidas para organizar os grupos do cardápio.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="mt-3 space-y-2">
              {categories.map((category: any, index: number) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  position={index + 1}
                  onEdit={() => onEdit(category)}
                  onDelete={() => setToDelete(category)}
                  onToggle={(active) => updateCategory(
                    { id: category.id, data: { active } },
                    { onError: (error) => toast.error(getApiErrorMessage(error, "Erro ao atualizar categoria"), { duration: 8000 }) },
                  )}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <DeleteConfirmation
        isOpen={!!toDelete}
        onOpenChange={(open) => { if (!open) setToDelete(null); }}
        onConfirm={async () => { if (toDelete) deleteCategory(toDelete.id); setToDelete(null); }}
        isLoading={false}
        type="categoria"
      />
    </div>
  );
}
