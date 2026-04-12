"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, AlertTriangle, FileText, Download, RotateCcw, Package2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

interface FiscalNote {
  id: string;
  attributes: {
    status: string;
    status_label: string;
    provider_id: string | null;
    nfe_number: string | null;
    access_key: string | null;
    pdf_url: string | null;
    error_message: string | null;
    issued_at: string | null;
    order_id: number;
    order_number: string;
    created_at: string;
  };
}

const STATUS_STYLES: Record<string, string> = {
  issued:     "bg-green-100 text-green-700",
  processing: "bg-yellow-100 text-yellow-700",
  pending:    "bg-gray-100 text-gray-600",
  error:      "bg-red-100 text-red-600",
  cancelled:  "bg-zinc-100 text-zinc-500",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

export default function NotasFiscaisPage() {
  const queryClient = useQueryClient();
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["fiscal-notes"],
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.FISCAL.NOTES);
      return (res.data?.data ?? []) as FiscalNote[];
    },
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => api.post(API_ENDPOINTS.FISCAL.RETRY(id), {}),
    onMutate: (id) => setRetryingId(id),
    onSuccess: () => {
      toast.success("Reemissão solicitada");
      queryClient.invalidateQueries({ queryKey: ["fiscal-notes"] });
    },
    onError: () => toast.error("Erro ao reemitir nota"),
    onSettled: () => setRetryingId(null),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <p className="text-red-500">Erro ao carregar notas fiscais</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-indigo-600" />
        <h1 className="text-xl font-semibold">Histórico de NF-e</h1>
      </div>

      {!data?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package2 className="h-12 w-12 mb-4" />
            <p>Nenhuma nota fiscal emitida ainda</p>
            <p className="text-sm mt-1">
              As NF-e são emitidas automaticamente quando um pedido é entregue
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Número NF-e</TableHead>
                  <TableHead>Chave de Acesso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((note) => {
                  const a = note.attributes;
                  return (
                    <TableRow key={note.id}>
                      <TableCell className="font-semibold text-muted-foreground">
                        {a.order_number}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(a.issued_at ?? a.created_at)}
                      </TableCell>
                      <TableCell>
                        {a.nfe_number ? (
                          <span className="font-mono text-sm">{a.nfe_number}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {a.access_key ? (
                          <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px] block" title={a.access_key}>
                            {a.access_key.slice(0, 22)}…
                          </span>
                        ) : a.error_message ? (
                          <span className="text-xs text-red-500 truncate max-w-[200px] block" title={a.error_message}>
                            {a.error_message.slice(0, 40)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          STATUS_STYLES[a.status] ?? "bg-gray-100 text-gray-600"
                        )}>
                          {a.status_label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {a.pdf_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(a.pdf_url!, "_blank")}
                            >
                              <Download className="h-3.5 w-3.5 mr-1" />
                              PDF
                            </Button>
                          )}
                          {a.status === "error" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={retryingId === note.id}
                              onClick={() => retryMutation.mutate(note.id)}
                            >
                              {retryingId === note.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                              ) : (
                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                              )}
                              Reemitir
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
