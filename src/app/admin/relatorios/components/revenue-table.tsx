"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MonthlyRevenueItem } from "../services/reports-service";

interface RevenueTableProps {
  data: MonthlyRevenueItem[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function RevenueTable({ data }: RevenueTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mês</TableHead>
          <TableHead className="text-right">Faturamento</TableHead>
          <TableHead className="text-right">Variação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={`${item.year}-${item.month}`}>
            <TableCell className="font-medium">{item.label}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.revenue)}
            </TableCell>
            <TableCell className="text-right">
              <VariationBadge variation={item.variation_percentage} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function VariationBadge({ variation }: { variation: number | null }) {
  if (variation === null) {
    return (
      <div className="flex items-center justify-end gap-1 text-muted-foreground">
        <Minus className="h-4 w-4" />
        <span className="text-sm">—</span>
      </div>
    );
  }

  if (variation > 0) {
    return (
      <div className="flex items-center justify-end gap-1">
        <TrendingUp className="h-4 w-4 text-green-600" />
        <Badge variant="outline" className="text-green-600 border-green-300">
          +{variation}%
        </Badge>
      </div>
    );
  }

  if (variation < 0) {
    return (
      <div className="flex items-center justify-end gap-1">
        <TrendingDown className="h-4 w-4 text-red-600" />
        <Badge variant="outline" className="text-red-600 border-red-300">
          {variation}%
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1 text-muted-foreground">
      <Minus className="h-4 w-4" />
      <Badge variant="outline">0%</Badge>
    </div>
  );
}
