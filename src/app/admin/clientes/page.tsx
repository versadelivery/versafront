"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Search, Edit, Eye, Contact, Ban, CheckCircle } from "lucide-react";
import AdminHeader from "@/components/admin/catalog-header";
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

  const handleToggleBlock = async (customer: any) => {
    const isBlocked = customer.attributes.blocked;
    const action = isBlocked ? "desbloquear" : "bloquear";
    if (!confirm(`Tem certeza que deseja ${action} o cliente "${customer.attributes.name}"?`)) return;
    await toggleBlock(customer.id, !isBlocked);
  };

  const handleSaveCustomer = async (data: any) => {
    if (isEditing && selectedCustomer) {
      await updateCustomer(selectedCustomer.id, data);
    } else {
      await createCustomer(data);
    }
  };

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
      <AdminHeader
        title="CLIENTES"
        description="Gerencie os clientes da sua loja"
        className="mb-4"
      />

      <div className="w-full max-w-7xl mx-auto p-0 md:p-4 lg:p-6 bg-white">
        <Card className="p-4 md:p-6 shadow-none border-none rounded-xs bg-white">
          {/* Header da tabela com busca e botão de criar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou celular..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-12 border-muted"
              />
            </div>

            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 h-12 gap-2"
              onClick={handleCreateCustomer}
            >
              <UserPlus className="h-4 w-4" />
              + Novo cliente
            </Button>
          </div>

          {/* Tabela de clientes */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground py-4">Nome</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Celular</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">E-mail</TableHead>
                  <TableHead className="font-semibold text-foreground py-4 text-center">Status</TableHead>
                  <TableHead className="font-semibold text-foreground py-4 text-center">Pedidos</TableHead>
                  <TableHead className="font-semibold text-foreground py-4 text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Contact className="h-8 w-8 text-muted-foreground" />
                        <p>Nenhum cliente encontrado</p>
                        {searchTerm && (
                          <p className="text-sm">Tente buscar por outros termos</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id} className={`hover:bg-muted/30 ${customer.attributes.blocked ? "opacity-60" : ""}`}>
                      <TableCell className="font-medium py-4">
                        {customer.attributes.name}
                      </TableCell>
                      <TableCell className="py-4">
                        {customer.attributes.cellphone}
                      </TableCell>
                      <TableCell className="py-4 text-muted-foreground">
                        {customer.attributes.email}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        {customer.attributes.blocked ? (
                          <Badge variant="destructive" className="border-0">
                            Bloqueado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                            Ativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-0">
                          {customer.attributes.orders_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs border-muted hover:bg-violet-600 hover:text-white"
                            onClick={() => router.push(`/admin/clientes/${customer.id}`)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs border-muted hover:bg-primary hover:text-white"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-8 px-3 text-xs border-muted ${customer.attributes.blocked ? "hover:bg-green-600 hover:text-white" : "hover:bg-red-600 hover:text-white"}`}
                            onClick={() => handleToggleBlock(customer)}
                          >
                            {customer.attributes.blocked ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Desbloquear
                              </>
                            ) : (
                              <>
                                <Ban className="h-3 w-3 mr-1" />
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

          {/* Rodapé com informações */}
          {customers.length > 0 && (
            <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
              <div>
                Mostrando {customers.length} clientes
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modal de cliente */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
        isEdit={isEditing}
      />
    </div>
  );
}
