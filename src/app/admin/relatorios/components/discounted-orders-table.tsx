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
import { DiscountedOrderEntry } from "../services/reports-service";

interface DiscountedOrdersTableProps {
  data: DiscountedOrderEntry[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function DiscountedOrdersTable({
  data,
}: DiscountedOrdersTableProps) {
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
          <TableHead className="w-16">#</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Subtotal</TableHead>
          <TableHead className="text-right">Desconto</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Cupom</TableHead>
          <TableHead>Pagamento</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium text-muted-foreground">
              {order.id}
            </TableCell>
            <TableCell>{order.date_label}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(order.total_items_price)}
            </TableCell>
            <TableCell className="text-right text-red-600 font-medium">
              -{formatCurrency(order.discount_amount)}
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(order.total_price)}
            </TableCell>
            <TableCell>
              {order.coupon_code ? (
                <Badge variant="secondary">{order.coupon_code}</Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {order.payment_method_label}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
