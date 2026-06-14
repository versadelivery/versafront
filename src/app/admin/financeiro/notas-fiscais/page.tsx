"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, AlertTriangle, FileText, Download, RotateCcw, Package2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
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
    <div className="space-y-4 py-6 max-w-3xl mx-auto min-h-[calc(100vh-6rem)]">
      <div className="flex items-center gap-3">
        <Link href="/admin/settings/fiscal" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
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
        <div className="space-y-3">
          {data.map((note) => {
            const a = note.attributes;
            return (
              <Card key={note.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">Pedido {a.order_number}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        STATUS_STYLES[a.status] ?? "bg-gray-100 text-gray-600"
                      )}>
                        {a.status_label}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(a.issued_at ?? a.created_at)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    {a.nfe_number && (
                      <div>
                        <span className="text-muted-foreground">Número: </span>
                        <span className="font-mono">{a.nfe_number}</span>
                      </div>
                    )}
                    {a.access_key && (
                      <div className="min-w-0">
                        <span className="text-muted-foreground">Chave: </span>
                        <span className="font-mono text-xs break-all">{a.access_key}</span>
                      </div>
                    )}
                  </div>

                  {a.error_message && (
                    <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">
                      {a.error_message}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
