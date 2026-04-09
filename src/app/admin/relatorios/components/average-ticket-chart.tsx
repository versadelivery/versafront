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
import { AverageTicketBreakdownItem } from "../services/reports-service";

interface AverageTicketChartProps {
  data: AverageTicketBreakdownItem[];
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
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: AverageTicketBreakdownItem }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-primary font-bold">
        Ticket Médio: {formatCurrency(item.average_ticket)}
      </p>
      <p className="text-xs text-muted-foreground">
        {item.orders} pedido{item.orders !== 1 ? "s" : ""} &middot;{" "}
        {formatCurrency(item.revenue)}
      </p>
    </div>
  );
}

export default function AverageTicketChart({ data }: AverageTicketChartProps) {
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
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis
          className="text-xs"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) =>
            new Intl.NumberFormat("pt-BR", {
              notation: "compact",
              compactDisplay: "short",
              style: "currency",
              currency: "BRL",
            }).format(value)
          }
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="average_ticket"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
