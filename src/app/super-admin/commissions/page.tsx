"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, DollarSign, Clock, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "@/api/routes";
import { getSuperAdminToken } from "@/lib/auth";
import { toast } from "sonner";

interface CommissionAttributes {
  id: number;
  reference_period: string;
  base_amount: string;
  amount: string;
  rate: string;
  status: string;
  status_description: string;
  available_at: string;
  created_at: string;
  referred_shop: { id: number; name: string; charge_amount: string };
  referrer_shop?: { id: number; name: string };
}

interface Commission {
  id: string;
  attributes: CommissionAttributes;
}

interface Summary {
  pending_count: number;
  pending_amount: number;
  available_count: number;
  available_amount: number;
  paid_count: number;
  paid_amount: number;
  suspended_count: number;
}

function formatCurrency(v: number | string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v));
}

function statusBadge(status: string, description: string) {
  const cls: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    available: "bg-green-100 text-green-800",
    paid: "bg-blue-100 text-blue-800",
    reversed: "bg-red-100 text-red-800",
    suspended: "bg-gray-100 text-gray-700",
  };
  return <Badge className={`${cls[status] ?? ""} hover:${cls[status] ?? ""}`}>{description}</Badge>;
}

export default function SuperAdminCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [creatingPayout, setCreatingPayout] = useState<string | null>(null);

  const token = getSuperAdminToken();

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        fetch(`${API_BASE_URL}/super_admins/commissions${status !== "all" ? `?status=${status}` : ""}`, { headers }),
        fetch(`${API_BASE_URL}/super_admins/commissions/summary`, { headers }),
      ]);
      const cData = await cRes.json();
      const sData = await sRes.json();
      setCommissions(cData.data ?? []);
      setSummary(sData);
    } catch {
      toast.error("Erro ao carregar comissões");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [status]);

  const handleCreatePayout = async (shopId: number, shopName: string) => {
    setCreatingPayout(String(shopId));
    try {
      const res = await fetch(`${API_BASE_URL}/super_admins/shops/${shopId}/payouts`, {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro ao criar repasse");
      }
      toast.success(`Repasse criado para ${shopName}`);
      fetchAll();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreatingPayout(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Indicações & Comissões</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão de comissões do programa de indicações.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Disponível (a repassar)", value: formatCurrency(summary.available_amount), count: summary.available_count, icon: DollarSign, color: "text-green-600" },
              { label: "Em carência", value: formatCurrency(summary.pending_amount), count: summary.pending_count, icon: Clock, color: "text-yellow-600" },
              { label: "Já repassado", value: formatCurrency(summary.paid_amount), count: summary.paid_count, icon: CheckCircle, color: "text-blue-600" },
              { label: "Suspenso (antifraude)", value: "", count: summary.suspended_count, icon: AlertTriangle, color: "text-red-600" },
            ].map((c) => (
              <Card key={c.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <c.icon className={`h-4 w-4 ${c.color}`} />
                    {c.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {c.value && <p className="text-xl font-bold">{c.value}</p>}
                  <p className="text-sm text-muted-foreground">{c.count} comissão(ões)</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Comissões</CardTitle>
            <div className="flex items-center gap-3">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="pending">Em carência</SelectItem>
                  <SelectItem value="paid">Repassado</SelectItem>
                  <SelectItem value="reversed">Estornado</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchAll}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : commissions.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma comissão encontrada.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Loja indicada</TableHead>
                    <TableHead>Mensalidade</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Disponível em</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((c) => {
                    const a = c.attributes;
                    const isAvailable = a.status === "available";
                    const shopId = a.referred_shop?.id;
                    return (
                      <TableRow key={c.id}>
                        <TableCell>{a.reference_period}</TableCell>
                        <TableCell className="font-medium">{a.referred_shop?.name}</TableCell>
                        <TableCell>{formatCurrency(a.base_amount)}</TableCell>
                        <TableCell className="font-semibold text-green-700">{formatCurrency(a.amount)}</TableCell>
                        <TableCell>{new Date(a.available_at).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>{statusBadge(a.status, a.status_description)}</TableCell>
                        <TableCell>
                          {isAvailable && shopId && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={creatingPayout === String(shopId)}
                              onClick={() => handleCreatePayout(shopId, a.referred_shop?.name ?? "")}
                            >
                              {creatingPayout === String(shopId) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                "Registrar repasse"
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
