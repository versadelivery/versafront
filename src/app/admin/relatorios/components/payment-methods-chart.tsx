"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { PaymentMethodEntry } from "../services/reports-service";

interface PaymentMethodsChartProps {
  data: PaymentMethodEntry[];
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
  payload?: { payload: PaymentMethodEntry }[];
}) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-medium">{item.label}</p>
      <p className="text-sm font-bold" style={{ color: item.color }}>
        {formatCurrency(item.revenue)}
      </p>
      <p className="text-xs text-muted-foreground">
        {item.order_count} pedido{item.order_count !== 1 ? "s" : ""} &middot;{" "}
        {item.revenue_percentage}%
      </p>
    </div>
  );
}

export default function PaymentMethodsChart({
  data,
}: PaymentMethodsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: PieLabelRenderProps) =>
            `${props.name} (${((props.percent ?? 0) * 100).toFixed(1)}%)`
          }
          outerRadius={120}
          dataKey="revenue"
          nameKey="label"
        >
          {data.map((entry) => (
            <Cell key={entry.key} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
