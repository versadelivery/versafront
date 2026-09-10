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
import { Loader2 } from "lucide-react";
import { usePayouts } from "../hooks/useReseller";

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}

export function PayoutsTable() {
  const { data, isLoading } = usePayouts();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const payouts = data?.data ?? [];

  if (payouts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Nenhum repasse registrado ainda.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Comissões</TableHead>
          <TableHead>Chave PIX</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Observações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payouts.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              {p.attributes.paid_at
                ? new Date(p.attributes.paid_at).toLocaleDateString("pt-BR")
                : new Date(p.attributes.created_at).toLocaleDateString("pt-BR")}
            </TableCell>
            <TableCell className="font-semibold text-green-700">
              {formatCurrency(p.attributes.total_amount)}
            </TableCell>
            <TableCell>{p.attributes.commissions_count}</TableCell>
            <TableCell className="font-mono text-sm">{p.attributes.pix_key ?? "—"}</TableCell>
            <TableCell>
              {p.attributes.status === "paid" ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pago</Badge>
              ) : (
                <Badge variant="secondary">Pendente</Badge>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {p.attributes.notes ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
