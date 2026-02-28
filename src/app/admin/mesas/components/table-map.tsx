"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Table, UpdatePositionsPayload } from "../services/table-service";
import TableCard from "./table-card";

interface TableMapProps {
  tables: Table[];
  onTableClick: (table: Table) => void;
  onConfigClick: (table: Table) => void;
  onUpdatePositions: (data: UpdatePositionsPayload) => Promise<void>;
}

function DraggableTableCard({
  table,
  onTableClick,
  onConfigClick,
}: {
  table: Table;
  onTableClick: (table: Table) => void;
  onConfigClick: (table: Table) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TableCard
        table={table}
        onClick={onTableClick}
        onConfigClick={onConfigClick}
      />
    </div>
  );
}

export default function TableMap({
  tables,
  onTableClick,
  onConfigClick,
  onUpdatePositions,
}: TableMapProps) {
  const [pendingPositions, setPendingPositions] = useState<
    Map<string, { position_x: number; position_y: number }>
  >(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!delta.x && !delta.y) return;

    const tableId = active.id as string;
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const currentPos = pendingPositions.get(tableId) || {
      position_x: table.attributes.position_x,
      position_y: table.attributes.position_y,
    };

    const newPos = {
      position_x: currentPos.position_x + delta.x,
      position_y: currentPos.position_y + delta.y,
    };

    const newPending = new Map(pendingPositions);
    newPending.set(tableId, newPos);
    setPendingPositions(newPending);

    try {
      await onUpdatePositions({
        positions: [{ id: tableId, ...newPos }],
      });
    } catch (error) {
      newPending.delete(tableId);
      setPendingPositions(new Map(newPending));
    }
  };

  const getTablePosition = (table: Table) => {
    const pending = pendingPositions.get(table.id);
    return {
      x: pending?.position_x ?? table.attributes.position_x,
      y: pending?.position_y ?? table.attributes.position_y,
    };
  };

  const hasPositionedTables = tables.some(
    (t) => t.attributes.position_x !== 0 || t.attributes.position_y !== 0
  );

  if (!hasPositionedTables) {
    return (
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
          {tables.map((table) => (
            <DraggableTableCard
              key={table.id}
              table={table}
              onTableClick={onTableClick}
              onConfigClick={onConfigClick}
            />
          ))}
        </div>
      </DndContext>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="relative w-full min-h-[600px] bg-gray-50 rounded-lg border border-dashed border-gray-300 overflow-auto">
        {tables.map((table) => {
          const pos = getTablePosition(table);
          return (
            <div
              key={table.id}
              className="absolute"
              style={{
                left: pos.x,
                top: pos.y,
                width: table.attributes.shape === "rectangle" ? 200 : 140,
              }}
            >
              <DraggableTableCard
                table={table}
                onTableClick={onTableClick}
                onConfigClick={onConfigClick}
              />
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}
