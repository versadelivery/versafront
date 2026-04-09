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
import { CouponUsageEntry } from "../services/reports-service";

interface CouponUsageTableProps {
  data: CouponUsageEntry[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function CouponUsageTable({ data }: CouponUsageTableProps) {
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
          <TableHead>Cupom</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">Usos</TableHead>
          <TableHead className="text-right">Total Desconto</TableHead>
          <TableHead className="text-right">Receita Pedidos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((coupon) => (
          <TableRow key={coupon.code}>
            <TableCell>
              <Badge variant="secondary">{coupon.code}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {coupon.discount_type_label}
            </TableCell>
            <TableCell className="text-right">
              {coupon.discount_type_label === "Percentual"
                ? `${coupon.value}%`
                : formatCurrency(coupon.value)}
            </TableCell>
            <TableCell className="text-right font-medium">
              {coupon.usage_count_period}
            </TableCell>
            <TableCell className="text-right text-red-600 font-medium">
              -{formatCurrency(coupon.total_discount_given)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(coupon.total_orders_revenue)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
