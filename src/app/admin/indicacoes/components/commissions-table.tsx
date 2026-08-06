"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Commission } from "../services/reseller-service";
import { useCommissions } from "../hooks/useReseller";
import { Loader2 } from "lucide-react";

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}

function statusBadge(status: Commission["attributes"]["status"], description: string) {
  const variants: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    available: "bg-green-100 text-green-800",
    paid: "bg-blue-100 text-blue-800",
    reversed: "bg-red-100 text-red-800",
    suspended: "bg-gray-100 text-gray-700",
  };
  return (
    <Badge className={`${variants[status] ?? ""} hover:${variants[status] ?? ""}`}>
      {description}
    </Badge>
  );
}

export function CommissionsTable() {
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading } = useCommissions(status !== "all" ? { status } : undefined);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const commissions = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Em carência</SelectItem>
            <SelectItem value="available">Disponível</SelectItem>
            <SelectItem value="paid">Repassado</SelectItem>
            <SelectItem value="reversed">Estornado</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{commissions.length} comissão(ões)</span>
      </div>

      {commissions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nenhuma comissão encontrada.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Período</TableHead>
              <TableHead>Loja indicada</TableHead>
              <TableHead>Mensalidade</TableHead>
              <TableHead>Comissão (12%)</TableHead>
              <TableHead>Disponível em</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissions.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.attributes.reference_period}</TableCell>
                <TableCell className="font-medium">{c.attributes.referred_shop.name}</TableCell>
                <TableCell>{formatCurrency(c.attributes.base_amount)}</TableCell>
                <TableCell className="font-semibold text-green-700">
                  {formatCurrency(c.attributes.amount)}
                </TableCell>
                <TableCell>
                  {new Date(c.attributes.available_at).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  {statusBadge(c.attributes.status, c.attributes.status_description)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
