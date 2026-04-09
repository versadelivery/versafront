"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, UtensilsCrossed } from "lucide-react";
import { useTableSessions } from "../hooks/use-table-sessions";
import { TableSession } from "../services/table-service";
import TableSessionDetailsModal from "./table-session-details-modal";

export default function TableHistory() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { sessions, loading, updateFilters, refetch } = useTableSessions({ status: "closed" });
  const [selectedSession, setSelectedSession] = useState<TableSession | null>(null);

  const handleFilter = () => {
    updateFilters({
      status: "closed",
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      Number(value)
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}min`;
    return `${mins}min`;
  };

  return (
    <>
      <Card className="p-4 md:p-6 shadow-none border-none rounded-xs bg-white">
        <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
          <div className="space-y-2 flex-1">
            <Label className="text-sm font-medium">Data inicial</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2 flex-1">
            <Label className="text-sm font-medium">Data final</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-11"
            />
          </div>
          <Button
            onClick={handleFilter}
            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white px-6 gap-2"
          >
            <Search className="h-4 w-4" />
            Filtrar
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <UITable>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-foreground py-4">Mesa</TableHead>
                <TableHead className="font-semibold text-foreground py-4">Cliente</TableHead>
                <TableHead className="font-semibold text-foreground py-4">Abertura</TableHead>
                <TableHead className="font-semibold text-foreground py-4">Fechamento</TableHead>
                <TableHead className="font-semibold text-foreground py-4">Duracao</TableHead>
                <TableHead className="font-semibold text-foreground py-4">Total</TableHead>
                <TableHead className="font-semibold text-foreground py-4 text-center">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                      <p>{loading ? "Carregando historico..." : "Nenhuma comanda encontrada"}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.id} className="hover:bg-muted/30">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono font-semibold">
                          {session.attributes.table_number}
                        </Badge>
                        {session.attributes.table_label && (
                          <span className="text-xs text-muted-foreground">
                            {session.attributes.table_label}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {session.attributes.customer_name || "-"}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {formatDate(session.attributes.opened_at)}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {formatDate(session.attributes.closed_at)}
                    </TableCell>
                    <TableCell className="py-4 text-sm">
                      {formatDuration(session.attributes.duration_minutes)}
                    </TableCell>
                    <TableCell className="py-4 font-medium">
                      {formatCurrency(session.attributes.total_amount)}
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs border-muted hover:bg-primary hover:text-white"
                        onClick={() => setSelectedSession(session)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </UITable>
        </div>

        {sessions.length > 0 && (
          <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
            <div>
              Mostrando {sessions.length} comandas
            </div>
            <div>
              Total:{" "}
              {formatCurrency(
                sessions.reduce((sum, s) => sum + Number(s.attributes.total_amount), 0)
              )}
            </div>
          </div>
        )}
      </Card>

      <TableSessionDetailsModal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
      />
    </>
  );
}
