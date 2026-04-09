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
import {
  Loader2,
  CreditCard,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Store,
  RefreshCw,
  ExternalLink,
  Play,
} from "lucide-react";
import { API_BASE_URL } from "@/api/routes";
import { getSuperAdminToken } from "@/lib/auth";
import { toast } from "sonner";

interface MonthlyChargeAdmin {
  id: string;
  type: string;
  attributes: {
    id: number;
    reference_month: number;
    reference_year: number;
    reference_period: string;
    monthly_revenue: string;
    charge_amount: string;
    billing_tier: string;
    status: "pending" | "paid" | "cancelled" | "overdue";
    status_description: string;
    tier_description: string;
    due_date: string;
    paid_at: string | null;
    is_overdue: boolean;
    days_until_due: number | null;
    asaas_invoice_url: string | null;
    shop: {
      id: number;
      name: string;
      slug: string;
      billing_delinquent: boolean;
      owner: {
        name: string;
        email: string;
      } | null;
    } | null;
  };
}

interface BillingSummary {
  total_charges: number;
  pending_charges: number;
  overdue_charges: number;
  paid_charges: number;
  total_pending_amount: number;
  total_paid_amount: number;
  current_month_revenue: number;
  delinquent_shops_count: number;
  active_billing_shops_count: number;
}

export default function SuperAdminBillingPage() {
  const [charges, setCharges] = useState<MonthlyChargeAdmin[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = getSuperAdminToken();

      const [chargesRes, summaryRes] = await Promise.all([
        fetch(
          `${API_BASE_URL}/super_admins/billings${
            statusFilter !== "all" ? `?status=${statusFilter}` : ""
          }`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        fetch(`${API_BASE_URL}/super_admins/billings/summary`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!chargesRes.ok || !summaryRes.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const chargesData = await chargesRes.json();
      const summaryData = await summaryRes.json();

      setCharges(chargesData.data || []);
      setSummary(summaryData);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar dados de billing");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleGenerateCharges = async () => {
    try {
      setIsGenerating(true);
      const token = getSuperAdminToken();

      const response = await fetch(`${API_BASE_URL}/super_admins/billings/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar cobranças");
      }

      const data = await response.json();
      toast.success(`Cobranças sendo geradas para ${data.period}`);

      // Aguarda um pouco e atualiza
      setTimeout(() => {
        fetchData();
      }, 3000);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao gerar cobranças");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "overdue":
        return "destructive";
      case "pending":
        return "secondary";
      case "cancelled":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF6] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cobranças</h1>
            <p className="text-gray-600 mt-1">
              Gerencie cobranças e mensalidades das lojas
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
            <Button onClick={handleGenerateCharges} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Gerar Cobranças
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Cobranças</p>
                  <p className="text-2xl font-bold">{summary?.total_charges || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Receita do Mês</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary?.current_month_revenue || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Pendente</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatCurrency(summary?.total_pending_amount || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lojas Inadimplentes</p>
                  <p className="text-2xl font-bold text-red-600">
                    {summary?.delinquent_shops_count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats secundários */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Pagas</span>
                <Badge variant="default">{summary?.paid_charges || 0}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Pendentes</span>
                <Badge variant="secondary">{summary?.pending_charges || 0}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Vencidas</span>
                <Badge variant="destructive">{summary?.overdue_charges || 0}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Lojas Ativas</span>
                <Badge variant="outline">
                  {summary?.active_billing_shops_count || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de cobranças */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Cobranças
              </CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="paid">Pagas</SelectItem>
                  <SelectItem value="overdue">Vencidas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {charges.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma cobrança encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loja</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Faturamento</TableHead>
                      <TableHead>Mensalidade</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charges.map((charge) => (
                      <TableRow key={charge.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {charge.attributes.shop?.name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {charge.attributes.shop?.owner?.email || ""}
                            </p>
                            {charge.attributes.shop?.billing_delinquent && (
                              <Badge variant="destructive" className="mt-1 text-xs">
                                Inadimplente
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {charge.attributes.reference_period}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(charge.attributes.monthly_revenue)}
                        </TableCell>
                        <TableCell className="font-bold">
                          {parseFloat(charge.attributes.charge_amount) > 0
                            ? formatCurrency(charge.attributes.charge_amount)
                            : "Grátis"}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">
                            {charge.attributes.tier_description}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              charge.attributes.is_overdue ? "text-red-500" : ""
                            }
                          >
                            {formatDate(charge.attributes.due_date)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(charge.attributes.status)}
                          >
                            {charge.attributes.status_description}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {charge.attributes.asaas_invoice_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={charge.attributes.asaas_invoice_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
