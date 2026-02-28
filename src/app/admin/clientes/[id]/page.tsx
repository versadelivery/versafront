"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, User, Mail, Phone, Calendar, ShoppingCart, Ban, CheckCircle } from "lucide-react";
import AdminHeader from "@/components/admin/catalog-header";
import CustomerModal from "../components/customer-modal";
import { useCustomerDetail } from "../hooks/useCustomerDetail";
import { customerService } from "../services/customerService";

const statusLabels: Record<string, string> = {
  received: "Recebido",
  accepted: "Aceito",
  in_analysis: "Em análise",
  in_preparation: "Em preparo",
  ready: "Pronto",
  left_for_delivery: "Saiu p/ entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  received: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  in_analysis: "bg-orange-100 text-orange-700",
  in_preparation: "bg-indigo-100 text-indigo-700",
  ready: "bg-emerald-100 text-emerald-700",
  left_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const paymentLabels: Record<string, string> = {
  cash: "Dinheiro",
  debit: "Débito",
  credit: "Crédito",
  manual_pix: "PIX",
};

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num || 0);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { customer, orders, loading, toggleBlock, refetch } = useCustomerDetail(id);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleBlock = async () => {
    if (!customer) return;
    const isBlocked = customer.attributes.blocked;
    const action = isBlocked ? "desbloquear" : "bloquear";
    if (!confirm(`Tem certeza que deseja ${action} o cliente "${customer.attributes.name}"?`)) return;
    await toggleBlock(!isBlocked);
  };

  const handleSave = async (data: any) => {
    await customerService.updateCustomer(id, { customer: data });
    await refetch();
  };

  if (loading) {
    return (
      <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
        <AdminHeader title="CLIENTE" description="Carregando..." className="mb-4" />
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Carregando...
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
        <AdminHeader title="CLIENTE" description="Cliente não encontrado" className="mb-4" />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">Cliente não encontrado</p>
          <Button variant="outline" onClick={() => router.push("/admin/clientes")}>
            Voltar para clientes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
      <AdminHeader
        title="CLIENTE"
        description={customer.attributes.name}
        className="mb-4"
      />

      <div className="w-full max-w-7xl mx-auto p-0 md:p-4 lg:p-6 space-y-6">
        {/* Botão voltar */}
        <Button
          variant="ghost"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/admin/clientes")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para clientes
        </Button>

        {/* Card de dados do cliente */}
        <Card className="p-6 bg-white">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-violet-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold">{customer.attributes.name}</h2>
                  {customer.attributes.blocked ? (
                    <Badge variant="destructive" className="border-0">
                      Bloqueado
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                      Ativo
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Cliente #{customer.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsModalOpen(true)}
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="outline"
                className={`gap-2 ${customer.attributes.blocked ? "hover:bg-green-600 hover:text-white" : "hover:bg-red-600 hover:text-white"}`}
                onClick={handleToggleBlock}
              >
                {customer.attributes.blocked ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Desbloquear
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4" />
                    Bloquear
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="text-sm font-medium">{customer.attributes.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Celular</p>
                <p className="text-sm font-medium">{customer.attributes.cellphone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Membro desde</p>
                <p className="text-sm font-medium">
                  {new Date(customer.attributes.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total de pedidos</p>
                <p className="text-sm font-medium">{customer.attributes.orders_count}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Histórico de pedidos */}
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4">Histórico de Pedidos</h3>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mb-3" />
              <p className="font-medium">Nenhum pedido encontrado</p>
              <p className="text-sm">Este cliente ainda não fez pedidos na sua loja.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-foreground py-4">#</TableHead>
                    <TableHead className="font-semibold text-foreground py-4">Data</TableHead>
                    <TableHead className="font-semibold text-foreground py-4">Status</TableHead>
                    <TableHead className="font-semibold text-foreground py-4">Pagamento</TableHead>
                    <TableHead className="font-semibold text-foreground py-4 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium py-4">
                        #{order.attributes.id}
                      </TableCell>
                      <TableCell className="py-4">
                        {formatDate(order.attributes.created_at)}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="secondary"
                          className={`${statusColors[order.attributes.status] || "bg-gray-100 text-gray-700"} border-0`}
                        >
                          {statusLabels[order.attributes.status] || order.attributes.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        {paymentLabels[order.attributes.payment_method] || order.attributes.payment_method}
                      </TableCell>
                      <TableCell className="py-4 text-right font-medium">
                        {formatCurrency(order.attributes.total_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      {/* Modal de edição */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        customer={customer}
        isEdit
      />
    </div>
  );
}
