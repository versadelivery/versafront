"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AveragePrepTimeEntry } from "../services/reports-service";

interface AveragePrepTimeChartProps {
  data: AveragePrepTimeEntry[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: AveragePrepTimeEntry }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-primary font-bold">
        {item.average_minutes} min
      </p>
      <p className="text-xs text-muted-foreground">
        {item.order_count} pedido{item.order_count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default function AveragePrepTimeChart({
  data,
}: AveragePrepTimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="label"
          className="text-xs"
          tick={{ fontSize: 10 }}
        />
        <YAxis
          className="text-xs"
          tick={{ fontSize: 12 }}
          allowDecimals={false}
          tickFormatter={(value) => `${value}min`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="average_minutes"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
