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
import { ItemProfitabilityEntry } from "../services/reports-service";

interface ItemProfitabilityTableProps {
  data: ItemProfitabilityEntry[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function ItemProfitabilityTable({
  data,
}: ItemProfitabilityTableProps) {
  if (data.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhum dado disponível
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Item</TableHead>
          <TableHead className="text-right">Qtd</TableHead>
          <TableHead className="text-right">Receita</TableHead>
          <TableHead className="text-right">Custo</TableHead>
          <TableHead className="text-right">Lucro</TableHead>
          <TableHead className="text-right">Margem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={item.name}>
            <TableCell className="font-medium text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="text-right">{item.quantity_sold}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.revenue)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.total_cost)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.profit)}
            </TableCell>
            <TableCell className="text-right">
              {item.margin_percentage !== null ? (
                <Badge
                  variant="outline"
                  className={
                    item.margin_percentage >= 50
                      ? "text-green-600 border-green-300"
                      : item.margin_percentage >= 20
                        ? "text-amber-600 border-amber-300"
                        : "text-red-600 border-red-300"
                  }
                >
                  {item.margin_percentage}%
                </Badge>
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
