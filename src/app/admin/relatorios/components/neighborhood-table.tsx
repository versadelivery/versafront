"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SalesByNeighborhoodEntry } from "../services/reports-service";

interface NeighborhoodTableProps {
  data: SalesByNeighborhoodEntry[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function NeighborhoodTable({ data }: NeighborhoodTableProps) {
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
          <TableHead>Bairro</TableHead>
          <TableHead className="text-right">Pedidos</TableHead>
          <TableHead className="text-right">Faturamento</TableHead>
          <TableHead className="text-right">Ticket Médio</TableHead>
          <TableHead className="text-right">% Pedidos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={item.neighborhood}>
            <TableCell className="font-medium text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell className="font-medium">{item.neighborhood}</TableCell>
            <TableCell className="text-right">{item.orders}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.revenue)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.average_ticket)}
            </TableCell>
            <TableCell className="text-right">
              {item.order_percentage}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
