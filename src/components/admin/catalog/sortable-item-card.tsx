"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ItemCard } from "./item-card";
import React from "react";

interface SortableItemCardProps {
  id: string;
  item: React.ComponentProps<typeof ItemCard>["item"];
  layout?: 'grid' | 'list';
}

export function SortableItemCard({ id, item, layout = 'grid' }: SortableItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      <div
        className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-sm rounded-full p-1.5 border border-[#E5E2DD] cursor-grab active:cursor-grabbing opacity-0 group-hover/sortable:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <ItemCard item={item} layout={layout} />
    </div>
  );
}
