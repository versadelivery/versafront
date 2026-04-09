"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DailyBreakdownItem } from "../services/reports-service";

interface SalesPeriodTableProps {
  data: DailyBreakdownItem[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function SalesPeriodTable({ data }: SalesPeriodTableProps) {
  const filteredData = data.filter((item) => item.orders > 0);

  if (filteredData.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhum pedido no período selecionado
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Pedidos</TableHead>
          <TableHead className="text-right">Faturamento</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((item) => (
          <TableRow key={item.date}>
            <TableCell className="font-medium">{item.label}</TableCell>
            <TableCell className="text-right">{item.orders}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.revenue)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
