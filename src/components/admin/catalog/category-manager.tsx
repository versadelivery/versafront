"use client";

import { useState } from "react";
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit2, GripVertical, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { useCatalogCategories } from "@/hooks/useCatalogCategories";
import { getApiErrorMessage } from "@/utils/api-error";
import { weekdaysSummary } from "./weekday-picker";

interface CategoryManagerProps {
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
      className={`flex items-center gap-2 rounded-md border bg-white px-2 py-1.5 text-sm ${isDragging ? "relative z-10 border-primary shadow-md" : "border-[#E5E2DD] hover:border-primary/40"} ${inactive ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        className="flex h-6 w-4 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground hover:text-gray-900 active:cursor-grabbing"
        aria-label={`Arrastar para reordenar ${name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <span className="text-xs font-semibold text-primary">{position}</span>
      <span className="font-medium text-gray-900">{name}</span>
      {(inactive || days) && (
        <span className="text-xs text-muted-foreground">{inactive ? "Inativa" : days}</span>
      )}
      <Switch
        className="h-5 w-9 cursor-pointer shadow-sm [&>span]:size-4"
        checked={!inactive}
        onCheckedChange={onToggle}
        aria-label={`Ativar ou desativar ${name}`}
      />
      <button type="button" className="cursor-pointer" onClick={onEdit} aria-label={`Editar ${name}`} title="Editar">
        <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-gray-900" />
      </button>
      <button type="button" className="cursor-pointer" onClick={onDelete} aria-label={`Remover ${name}`} title="Remover">
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </button>
    </div>
  );
}

export function CategoryManager({ onEdit }: CategoryManagerProps) {
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
    <div className="mb-4 rounded-md border border-[#E5E2DD] bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tags className="h-4 w-4 text-primary" />
          <div>
            <p className="font-tomato text-sm font-semibold text-gray-900">Categorias</p>
            <p className="text-xs text-muted-foreground">Arraste pelo ícone <GripVertical className="inline h-3 w-3" /> para definir a ordem em que aparecem na loja.</p>
          </div>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="mt-3 rounded-md border border-dashed border-[#E5E2DD] bg-[#FAF9F7] px-4 py-6 text-center">
          <p className="text-sm font-medium text-gray-900">Nenhuma categoria ainda</p>
          <p className="mt-1 text-xs text-muted-foreground">Crie categorias como Churrasco ou Bebidas para organizar os grupos do cardápio.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={rectSortingStrategy}>
            <div className="mt-3 flex flex-wrap gap-2">
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
