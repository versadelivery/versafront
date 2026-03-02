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
import { CustomerAcquisitionBreakdownItem } from "../services/reports-service";

interface CustomerAcquisitionChartProps {
  data: CustomerAcquisitionBreakdownItem[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-primary font-bold">
        {payload[0].value} novo{payload[0].value !== 1 ? "s" : ""} cliente
        {payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default function CustomerAcquisitionChart({
  data,
}: CustomerAcquisitionChartProps) {
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
        <YAxis className="text-xs" tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="new_customers"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
