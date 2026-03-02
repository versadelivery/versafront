"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeliveryFeeEntry } from "../services/reports-service";

interface DeliveryFeesTableProps {
  data: DeliveryFeeEntry[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function DeliveryFeesTable({ data }: DeliveryFeesTableProps) {
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
          <TableHead>Motoboy</TableHead>
          <TableHead className="text-right">Entregas</TableHead>
          <TableHead className="text-right">Total Taxas</TableHead>
          <TableHead className="text-right">Taxa Média</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((entry) => (
          <TableRow key={entry.delivery_person}>
            <TableCell className="font-medium">
              {entry.delivery_person}
            </TableCell>
            <TableCell className="text-right">{entry.order_count}</TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(entry.total_fees)}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {formatCurrency(entry.average_fee)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
