"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TopCustomerEntry } from "../services/reports-service";

interface TopCustomersTableProps {
  data: TopCustomerEntry[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function TopCustomersTable({ data }: TopCustomersTableProps) {
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
          <TableHead>Telefone</TableHead>
          <TableHead className="text-right">Pedidos</TableHead>
          <TableHead className="text-right">Total Gasto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((customer, index) => (
          <TableRow key={`${customer.name}-${customer.phone}`}>
            <TableCell className="font-medium text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell className="font-medium">{customer.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {customer.phone || "—"}
            </TableCell>
            <TableCell className="text-right">
              {customer.order_count}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(customer.total_spent)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
