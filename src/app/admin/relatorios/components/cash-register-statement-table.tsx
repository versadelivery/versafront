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
import { CashRegisterTransactionEntry } from "../services/reports-service";

interface CashRegisterStatementTableProps {
  data: CashRegisterTransactionEntry[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function CashRegisterStatementTable({
  data,
}: CashRegisterStatementTableProps) {
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
          <TableHead>Data/Hora</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="text-muted-foreground">
              {transaction.date_label}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  transaction.type === "entry" ? "default" : "destructive"
                }
              >
                {transaction.kind_label}
              </Badge>
            </TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell
              className={`text-right font-medium ${
                transaction.type === "entry"
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {transaction.type === "entry" ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
