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
import { ItemModificationEntry } from "../services/reports-service";

interface ItemModificationsTableProps {
  data: ItemModificationEntry[];
}

export default function ItemModificationsTable({
  data,
}: ItemModificationsTableProps) {
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
          <TableHead>Item</TableHead>
          <TableHead>Ação</TableHead>
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
            <TableCell>{item.item_name}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  item.action === "destroy"
                    ? "text-red-600 border-red-300"
                    : "text-amber-600 border-amber-300"
                }
              >
                {item.action === "destroy" ? "Removido" : "Alterado"}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {item.changes}
            </TableCell>
            <TableCell>{item.user_name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
