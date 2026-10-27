"use client";

import { ReactNode, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, Edit2, GripVertical, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { useCatalogCategories } from "@/hooks/useCatalogCategories";
import { getApiErrorMessage } from "@/utils/api-error";
import { weekdaysSummary } from "./weekday-picker";

interface CategorySectionProps {
  /** undefined = grupos sem categoria (não arrasta, não edita) */
  category?: any;
  position?: number;
  groupCount: number;
  expanded: boolean;
  onToggleExpanded: () => void;
  onEdit?: () => void;
  children: ReactNode;
}

export function CategorySection({ category, position, groupCount, expanded, onToggleExpanded, onEdit, children }: CategorySectionProps) {
  const { updateCategory, deleteCategory } = useCatalogCategories();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category?.id ?? "uncategorized",
    disabled: !category,
  });

  const name: string = category?.attributes.name ?? "Sem categoria";
  const inactive = category?.attributes.active === false;
  const days = category ? weekdaysSummary(category.attributes) : null;
  const groupsLabel = `${groupCount} ${groupCount === 1 ? "grupo" : "grupos"}`;
  const status = !category ? "Grupos que não pertencem a nenhuma categoria" : inactive ? "Inativa: oculta no cardápio" : days ? `Somente: ${days}` : "Todos os dias";

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`overflow-hidden rounded-md border bg-white ${isDragging ? "relative z-20 border-primary shadow-lg" : "border-[#E5E2DD]"}`}
    >
      <div className="flex items-center gap-2 px-2 py-2.5 sm:gap-3 sm:px-3">
        {category ? (
          <button
            type="button"
            className="flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-[#FAF9F7] hover:text-gray-900 active:cursor-grabbing"
            aria-label={`Arrastar para reordenar a categoria ${name}`}
            title="Arraste para reordenar categorias"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : (
          <span className="h-8 w-6 shrink-0" />
        )}

        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          className="group/toggle flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md py-1 text-left hover:bg-[#FAF9F7]"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black text-sm font-semibold text-white">
            {position ?? <Tags className="h-3.5 w-3.5" />}
          </span>
          <span className={`min-w-0 flex-1 ${inactive ? "opacity-60" : ""}`}>
            <span className="block truncate font-tomato text-base font-semibold text-gray-900">{name}</span>
            <span className="block truncate text-xs text-muted-foreground">{groupsLabel} · {status}</span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm transition-colors group-hover/toggle:border-black group-hover/toggle:bg-gray-100" title={expanded ? "Recolher" : "Expandir"}>
            <ChevronDown className={`h-6 w-6 transition-transform ${expanded ? "rotate-180" : ""}`} strokeWidth={2.5} />
          </span>
        </button>

        {category && (
          <>
            <Switch
              className="cursor-pointer"
              checked={!inactive}
              onCheckedChange={(active) => updateCategory(
                { id: category.id, data: { active } },
                { onError: (error) => toast.error(getApiErrorMessage(error, "Erro ao atualizar categoria"), { duration: 8000 }) },
              )}
              aria-label={`Ativar ou desativar ${name}`}
            />
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={onEdit} aria-label={`Editar ${name}`} title="Editar categoria">
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 cursor-pointer hover:bg-red-50" onClick={() => setConfirmDelete(true)} aria-label={`Remover ${name}`} title="Remover categoria">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </>
        )}
      </div>

      {expanded && <div className="space-y-3 border-t border-[#E5E2DD] bg-[#FAF9F7] p-3">{children}</div>}

      {category && (
        <DeleteConfirmation
          isOpen={confirmDelete}
          onOpenChange={setConfirmDelete}
          onConfirm={async () => { deleteCategory(category.id); setConfirmDelete(false); }}
          isLoading={false}
          type="categoria"
        />
      )}
    </section>
  );
}
