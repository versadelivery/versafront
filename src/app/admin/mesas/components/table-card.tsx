"use client";

import { Clock, Users, Settings } from "lucide-react";
import { Table } from "../services/table-service";

interface TableCardProps {
  table: Table;
  onClick: (table: Table) => void;
  onConfigClick: (table: Table) => void;
}

export default function TableCard({ table, onClick, onConfigClick }: TableCardProps) {
  const attrs = table.attributes;
  const session = attrs.current_session;

  const getShapeClass = () => {
    switch (attrs.shape) {
      case "round":
        return "rounded-full";
      case "rectangle":
        return "rounded-lg aspect-[2/1]";
      default:
        return "rounded-lg aspect-square";
    }
  };

  const getStatusColors = () => {
    if (!attrs.active) {
      return "bg-gray-100 border-gray-300 text-gray-500";
    }
    if (attrs.occupied) {
      return "bg-white border-red-300 text-red-700 hover:bg-gray-50";
    }
    return "bg-white border-emerald-300 text-emerald-700 hover:bg-gray-50";
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h${mins > 0 ? `${mins}m` : ""}`;
    return `${mins}m`;
  };

  return (
    <div className="relative group">
      <button
        onClick={() => onClick(table)}
        disabled={!attrs.active}
        className={`
          w-full min-h-[120px] border-2 transition-all duration-200
          flex flex-col items-center justify-center gap-1 p-3
          ${getShapeClass()} ${getStatusColors()}
          ${attrs.active ? "cursor-pointer" : "cursor-not-allowed opacity-60"}
        `}
      >
        <span className="text-lg font-bold">{attrs.number}</span>
        {attrs.label && (
          <span className="text-xs truncate max-w-full">{attrs.label}</span>
        )}

        {attrs.occupied && session && (
          <div className="flex flex-col items-center gap-0.5 mt-1">
            <div className="flex items-center gap-1 text-xs">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(session.attributes.duration_minutes)}</span>
            </div>
            {session.attributes.customer_name && (
              <span className="text-xs truncate max-w-full">
                {session.attributes.customer_name}
              </span>
            )}
          </div>
        )}

        {!attrs.occupied && attrs.active && (
          <div className="flex items-center gap-1 text-xs mt-1">
            <Users className="w-3 h-3" />
            <span>{attrs.capacity}</span>
          </div>
        )}

        {!attrs.active && (
          <span className="text-xs mt-1">Inativa</span>
        )}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onConfigClick(table);
        }}
        className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-200 rounded-full
          flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100
          transition-opacity duration-200 hover:bg-gray-50"
      >
        <Settings className="w-3.5 h-3.5 text-gray-500" />
      </button>
    </div>
  );
}
