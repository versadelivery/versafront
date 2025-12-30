"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Store, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/api/routes";
import { getSuperAdminToken } from "@/lib/auth";

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
    owner: {
      name: string;
      email: string;
    } | null;
  };
}

export default function MerchantsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchShops();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Merchants</h1>
          <p className="text-gray-600 mt-2">Listagem de todas as lojas cadastradas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Lojas ({shops.length})
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
                        <div className="flex gap-2">
                          <Badge variant={shop.attributes.is_closed ? "secondary" : "default"}>
                            {shop.attributes.is_closed ? "Fechada" : "Aberta"}
                          </Badge>
                          {shop.attributes.billing_delinquent && (
                            <Badge variant="destructive">Inadimplente</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(shop.attributes.created_at).toLocaleDateString("pt-BR")}
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
