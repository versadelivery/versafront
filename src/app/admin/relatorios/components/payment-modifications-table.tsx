"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight } from "lucide-react";
import { PaymentModificationEntry } from "../services/reports-service";

interface PaymentModificationsTableProps {
  data: PaymentModificationEntry[];
}

export default function PaymentModificationsTable({
  data,
}: PaymentModificationsTableProps) {
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
          <TableHead>Pedido</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Alteração</TableHead>
          <TableHead>Usuário</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={`${item.order_id}-${index}`}>
            <TableCell className="font-medium">#{item.order_id}</TableCell>
            <TableCell className="text-muted-foreground">
              {item.date_label}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span>{item.old_payment_method}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{item.new_payment_method}</span>
              </div>
            </TableCell>
            <TableCell>{item.user_name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
