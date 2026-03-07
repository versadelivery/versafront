"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ArrowLeft,
  Edit,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingCart,
  Ban,
  CheckCircle,
  ClipboardList,
} from "lucide-react";
import CustomerModal from "../components/customer-modal";
import { useCustomerDetail } from "../hooks/useCustomerDetail";
import { customerService } from "../services/customerService";

const statusLabels: Record<string, string> = {
  received: "Recebido",
  accepted: "Aceito",
  in_analysis: "Em analise",
  in_preparation: "Em preparo",
  ready: "Pronto",
  left_for_delivery: "Saiu p/ entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusBorderColors: Record<string, string> = {
  received: "border-amber-400 text-amber-700",
  accepted: "border-blue-400 text-blue-700",
  in_analysis: "border-orange-400 text-orange-700",
  in_preparation: "border-indigo-400 text-indigo-700",
  ready: "border-emerald-400 text-emerald-700",
  left_for_delivery: "border-purple-400 text-purple-700",
  delivered: "border-green-400 text-green-700",
  cancelled: "border-red-400 text-red-700",
};

const statusDotColors: Record<string, string> = {
  received: "bg-amber-400",
  accepted: "bg-blue-400",
  in_analysis: "bg-orange-400",
  in_preparation: "bg-indigo-400",
  ready: "bg-emerald-400",
  left_for_delivery: "bg-purple-400",
  delivered: "bg-green-400",
  cancelled: "bg-red-400",
};

const paymentLabels: Record<string, string> = {
  cash: "Dinheiro",
  debit: "Debito",
  credit: "Credito",
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
      <div className="min-h-screen bg-[#FAF9F7]">
        <div className="bg-white border-b border-[#E5E2DD]">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
            <div className="flex items-center h-16">
              <div className="flex items-center gap-4">
                <a
                  href="/admin/clientes"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:block">Voltar</span>
                </a>
                <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
                <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">Cliente</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          Carregando...
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-[#FAF9F7]">
        <div className="bg-white border-b border-[#E5E2DD]">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
            <div className="flex items-center h-16">
              <div className="flex items-center gap-4">
                <a
                  href="/admin/clientes"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:block">Voltar</span>
                </a>
                <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
                <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">Cliente</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-sm text-muted-foreground">Cliente nao encontrado</p>
          <Button
            variant="outline"
            className="rounded-md border border-gray-300 cursor-pointer"
            onClick={() => router.push("/admin/clientes")}
          >
            Voltar para clientes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header admin padrao */}
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a
                href="/admin/clientes"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </a>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900 truncate max-w-[300px]">
                {customer.attributes.name}
              </h1>
              {customer.attributes.blocked ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-white text-sm font-semibold border-red-400 text-red-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Bloqueado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-white text-sm font-semibold border-green-400 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Ativo
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2 rounded-md border border-gray-300 cursor-pointer h-9 text-sm"
                onClick={() => setIsModalOpen(true)}
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Button
                variant="outline"
                className={`gap-2 rounded-md border border-gray-300 cursor-pointer h-9 text-sm ${
                  customer.attributes.blocked
                    ? "hover:bg-green-600 hover:text-white"
                    : "hover:bg-red-600 hover:text-white"
                }`}
                onClick={handleToggleBlock}
              >
                {customer.attributes.blocked ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Desbloquear</span>
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4" />
                    <span className="hidden sm:inline">Bloquear</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Card de dados do cliente */}
        <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-tomato text-base font-semibold text-gray-900">Informacoes do cliente</h2>
            <span className="text-sm text-muted-foreground ml-auto">#{customer.id}</span>
          </div>
          <div className="px-5 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-[#F0EFEB] flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{customer.attributes.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-[#F0EFEB] flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Celular</p>
                  <p className="text-sm font-medium text-gray-900">{customer.attributes.cellphone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-[#F0EFEB] flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Membro desde</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(customer.attributes.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-[#F0EFEB] flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Total de pedidos</p>
                  <p className="text-sm font-medium text-gray-900">{customer.attributes.orders_count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Historico de pedidos */}
        <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <h2 className="font-tomato text-base font-semibold text-gray-900">Historico de Pedidos</h2>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mb-3" />
              <p className="text-sm font-medium">Nenhum pedido encontrado</p>
              <p className="text-sm">Este cliente ainda nao fez pedidos na sua loja.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#FAF9F7]">
                  <TableHead className="font-semibold text-foreground py-3 text-sm">#</TableHead>
                  <TableHead className="font-semibold text-foreground py-3 text-sm">Data</TableHead>
                  <TableHead className="font-semibold text-foreground py-3 text-sm">Status</TableHead>
                  <TableHead className="font-semibold text-foreground py-3 text-sm hidden sm:table-cell">Pagamento</TableHead>
                  <TableHead className="font-semibold text-foreground py-3 text-sm text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="border-b border-[#E5E2DD] hover:bg-[#FAF9F7]">
                    <TableCell className="py-3 text-sm font-medium">
                      #{order.attributes.id}
                    </TableCell>
                    <TableCell className="py-3 text-sm">
                      {formatDate(order.attributes.created_at)}
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-white text-sm font-semibold ${
                          statusBorderColors[order.attributes.status] || "border-[#E5E2DD] text-gray-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            statusDotColors[order.attributes.status] || "bg-gray-400"
                          }`}
                        />
                        {statusLabels[order.attributes.status] || order.attributes.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-sm hidden sm:table-cell">
                      {paymentLabels[order.attributes.payment_method] || order.attributes.payment_method}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-right font-medium">
                      {formatCurrency(order.attributes.total_price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Modal de edicao */}
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
