"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  UserPlus,
  Search,
  Edit,
  Eye,
  Users,
  Ban,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import CustomerModal from "./components/customer-modal";
import { useCustomers } from "./hooks/useCustomers";

export default function CustomersPage() {
  const router = useRouter();
  const {
    customers,
    loading,
    searchTerm,
    handleSearch,
    createCustomer,
    updateCustomer,
    toggleBlock,
  } = useCustomers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [blockTarget, setBlockTarget] = useState<any>(null);

  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleToggleBlock = (customer: any) => {
    setBlockTarget(customer);
  };

  const confirmToggleBlock = async () => {
    if (!blockTarget) return;
    await toggleBlock(blockTarget.id, !blockTarget.attributes.blocked);
    setBlockTarget(null);
  };

  const handleSaveCustomer = async (data: any) => {
    if (isEditing && selectedCustomer) {
      await updateCustomer(selectedCustomer.id, data);
    } else {
      await createCustomer(data);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header admin padrao */}
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </a>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">
                Clientes
              </h1>
            </div>

            <Button
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 rounded-md h-9 text-sm border border-gray-300 cursor-pointer"
              onClick={handleCreateCustomer}
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Cliente</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6">
        {/* Busca */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou celular..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-10 border-[#E5E2DD] rounded-md bg-white"
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#FAF9F7]">
                <TableHead className="font-semibold text-foreground py-3 text-sm">Nome</TableHead>
                <TableHead className="font-semibold text-foreground py-3 text-sm">Celular</TableHead>
                <TableHead className="font-semibold text-foreground py-3 text-sm hidden md:table-cell">E-mail</TableHead>
                <TableHead className="font-semibold text-foreground py-3 text-sm text-center">Status</TableHead>
                <TableHead className="font-semibold text-foreground py-3 text-sm text-center">Pedidos</TableHead>
                <TableHead className="font-semibold text-foreground py-3 text-sm text-center">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Nenhum cliente encontrado</p>
                      {searchTerm && (
                        <p className="text-sm">Tente buscar por outros termos</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className={`border-b border-[#E5E2DD] hover:bg-[#FAF9F7] ${customer.attributes.blocked ? "opacity-50" : ""}`}
                  >
                    <TableCell className="py-3">
                      <span className="block max-w-[200px] truncate text-sm font-medium text-gray-900">
                        {customer.attributes.name}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-sm">
                      {customer.attributes.cellphone}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground hidden md:table-cell">
                      <span className="block max-w-[220px] truncate">
                        {customer.attributes.email}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
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
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md border bg-white text-sm font-semibold border-primary text-primary">
                        {customer.attributes.orders_count}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-sm rounded-md border border-gray-300 cursor-pointer hover:bg-primary hover:text-white"
                          onClick={() => router.push(`/admin/clientes/${customer.id}`)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-sm rounded-md border border-gray-300 cursor-pointer hover:bg-primary hover:text-white"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-8 px-2.5 text-sm rounded-md border border-gray-300 cursor-pointer ${
                            customer.attributes.blocked
                              ? "hover:bg-green-600 hover:text-white"
                              : "hover:bg-red-600 hover:text-white"
                          }`}
                          onClick={() => handleToggleBlock(customer)}
                        >
                          {customer.attributes.blocked ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Desbloquear
                            </>
                          ) : (
                            <>
                              <Ban className="h-3.5 w-3.5 mr-1" />
                              Bloquear
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Rodape */}
        {customers.length > 0 && (
          <div className="flex items-center justify-between pt-3 text-sm text-muted-foreground">
            <span>Mostrando {customers.length} clientes</span>
          </div>
        )}
      </div>

      {/* Modal de cliente */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
        isEdit={isEditing}
      />

      {/* Confirmação de bloqueio */}
      <AlertDialog open={!!blockTarget} onOpenChange={(open) => !open && setBlockTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockTarget?.attributes.blocked ? "Desbloquear cliente" : "Bloquear cliente"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockTarget?.attributes.blocked
                ? `Deseja desbloquear "${blockTarget?.attributes.name}"? O cliente poderá fazer pedidos novamente.`
                : `Deseja bloquear "${blockTarget?.attributes.name}"? O cliente não poderá fazer pedidos.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={`cursor-pointer ${
                blockTarget?.attributes.blocked
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
              onClick={confirmToggleBlock}
            >
              {blockTarget?.attributes.blocked ? "Desbloquear" : "Bloquear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
