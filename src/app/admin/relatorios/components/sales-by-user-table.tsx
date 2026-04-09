"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SalesByUserEntry } from "../services/reports-service";

interface SalesByUserTableProps {
  data: SalesByUserEntry[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function SalesByUserTable({ data }: SalesByUserTableProps) {
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
          <TableHead>Atendente</TableHead>
          <TableHead>Cargo</TableHead>
          <TableHead className="text-right">Pedidos</TableHead>
          <TableHead className="text-right">Faturamento</TableHead>
          <TableHead className="text-right">Ticket Médio</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={item.user_name}>
            <TableCell className="font-medium text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell className="font-medium">{item.user_name}</TableCell>
            <TableCell className="text-muted-foreground">
              {item.user_role}
            </TableCell>
            <TableCell className="text-right">{item.order_count}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.revenue)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.average_ticket)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
