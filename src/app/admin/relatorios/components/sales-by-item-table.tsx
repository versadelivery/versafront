"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SalesItemEntry } from "../services/reports-service";

interface SalesByItemTableProps {
  data: SalesItemEntry[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function SalesByItemTable({ data }: SalesByItemTableProps) {
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
          <TableHead>Nome</TableHead>
          <TableHead className="text-right">Qtd</TableHead>
          <TableHead className="text-right">Faturamento</TableHead>
          <TableHead className="text-right">% do Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={item.name}>
            <TableCell className="font-medium text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="text-right">{item.quantity}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.revenue)}
            </TableCell>
            <TableCell className="text-right">{item.percentage}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
