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
import { Store, Loader2, CheckCircle, XCircle } from "lucide-react";
import { API_BASE_URL } from "@/api/routes";
import { getSuperAdminToken } from "@/lib/auth";
import { toast } from "sonner";

interface Shop {
  id: string;
  attributes: {
    id: number;
    name: string;
    slug: string;
    cellphone: string;
    created_at: string;
    billing_delinquent: boolean;
    is_closed: boolean;
    approved: boolean;
    approved_at: string | null;
    owner: {
      name: string;
      email: string;
    } | null;
  };
}

export default function MerchantsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingShopId, setLoadingShopId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = async () => {
    try {
      const token = getSuperAdminToken();
      const response = await fetch(`${API_BASE_URL}/super_admins/shops`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar merchants");
      }

      const data = await response.json();
      setShops(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleApprove = async (shopId: string) => {
    setLoadingShopId(shopId);
    try {
      const token = getSuperAdminToken();
      const response = await fetch(`${API_BASE_URL}/super_admins/shops/${shopId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao aprovar merchant");
      }

      toast.success("Merchant aprovado com sucesso");
      await fetchShops();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao aprovar");
    } finally {
      setLoadingShopId(null);
    }
  };

  const handleDisapprove = async (shopId: string) => {
    setLoadingShopId(shopId);
    try {
      const token = getSuperAdminToken();
      const response = await fetch(`${API_BASE_URL}/super_admins/shops/${shopId}/disapprove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao desativar merchant");
      }

      toast.success("Merchant desativado com sucesso");
      await fetchShops();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao desativar");
    } finally {
      setLoadingShopId(null);
    }
  };

  const pendingCount = shops.filter(s => !s.attributes.approved).length;
  const approvedCount = shops.filter(s => s.attributes.approved).length;

  return (
    <div className="min-h-screen bg-[#FFFDF6] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lojas</h1>
          <p className="text-gray-600 mt-2">Gerencie as lojas cadastradas na plataforma</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{shops.length}</div>
              <p className="text-sm text-gray-500">Total de lojas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
              <p className="text-sm text-gray-500">Aprovadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
              <p className="text-sm text-gray-500">Pendentes</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Lojas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : shops.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma loja cadastrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Proprietário</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">
                        {shop.attributes.name}
                      </TableCell>
                      <TableCell>
                        {shop.attributes.owner ? (
                          <div>
                            <p className="font-medium">{shop.attributes.owner.name}</p>
                            <p className="text-sm text-gray-500">{shop.attributes.owner.email}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{shop.attributes.cellphone}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant={shop.attributes.approved ? "default" : "secondary"}>
                            {shop.attributes.approved ? "Aprovado" : "Pendente"}
                          </Badge>
                          {shop.attributes.billing_delinquent && (
                            <Badge variant="destructive">Inadimplente</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(shop.attributes.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        {shop.attributes.approved ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisapprove(shop.id)}
                            disabled={loadingShopId === shop.id}
                          >
                            {loadingShopId === shop.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Desativar
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(shop.id)}
                            disabled={loadingShopId === shop.id}
                          >
                            {loadingShopId === shop.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprovar
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
