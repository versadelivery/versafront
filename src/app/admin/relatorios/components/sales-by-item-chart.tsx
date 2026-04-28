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
import { SalesItemEntry } from "../services/reports-service";

interface SalesByItemChartProps {
  data: SalesItemEntry[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: SalesItemEntry }[];
}) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-medium">{item.name}</p>
      <p className="text-sm text-primary font-bold">
        {formatCurrency(item.revenue)}
      </p>
      <p className="text-xs text-muted-foreground">
        {item.quantity} un. · {item.percentage}% do total
      </p>
    </div>
  );
}

export default function SalesByItemChart({ data }: SalesByItemChartProps) {
  const top10 = data.slice(0, 10);
  const chartHeight = Math.max(300, top10.length * 40);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={top10}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
        <XAxis
          type="number"
          className="text-xs"
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => formatCurrency(v)}
        />
        <YAxis
          type="category"
          dataKey="name"
          className="text-xs"
          tick={{ fontSize: 12 }}
          width={120}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="revenue"
          fill="hsl(var(--primary))"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
