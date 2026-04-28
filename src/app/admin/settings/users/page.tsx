"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  UserPlus,
  Search,
  Edit,
  Users,
  Trash2,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import UserModal from "./components/user-modal";
import { useUsers } from "./hooks/useUsers";

export default function UsersManagementPage() {
  const {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [initialDeleteConfirm, setInitialDeleteConfirm] = useState(false);

  const filteredUsers = users.filter((user: any) =>
    user.attributes.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeStyle = (role: string) => {
    const styles: Record<string, string> = {
      owner: "bg-white border-red-400 text-red-700",
      employee: "bg-white border-blue-400 text-blue-700",
      delivery_man: "bg-white border-purple-400 text-purple-700"
    };
    return styles[role] || "bg-white border-[#E5E2DD] text-gray-700";
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: "Proprietário",
      employee: "Funcionário",
      delivery_man: "Entregador"
    };
    return labels[role] || role;
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setInitialDeleteConfirm(false);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditing(true);
    setInitialDeleteConfirm(false);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userData: any) => {
    if (isEditing && selectedUser) {
      await updateUser(selectedUser.id, userData);
    } else {
      await createUser(userData);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  const handleConfirmDeleteUser = (user: any) => {
    setSelectedUser(user);
    setIsEditing(true);
    setInitialDeleteConfirm(true);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header admin padrao */}
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/settings"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </Link>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">Gerenciamento de Usuários</h1>
            </div>
            <Button
              className="rounded-md border border-gray-300 cursor-pointer bg-primary text-white hover:bg-primary/90 gap-2"
              onClick={handleCreateUser}
            >
              <UserPlus className="h-4 w-4" />
              Criar usuário
            </Button>
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* SectionCard: Usuarios */}
        <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="font-tomato text-base font-semibold text-gray-900">Usuários</h2>
              <span className="text-sm text-muted-foreground">({users.length})</span>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por email ou nome..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm rounded-md border-[#E5E2DD]"
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E5E2DD]">
                  <TableHead className="font-medium text-sm text-muted-foreground py-3">ID</TableHead>
                  <TableHead className="font-medium text-sm text-muted-foreground py-3">E-mail</TableHead>
                  <TableHead className="font-medium text-sm text-muted-foreground py-3">Nome</TableHead>
                  <TableHead className="font-medium text-sm text-muted-foreground py-3">Tipo</TableHead>
                  <TableHead className="font-medium text-sm text-muted-foreground py-3 text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-gray-300" />
                        <p className="text-sm">Nenhum usuário encontrado</p>
                        {searchTerm && (
                          <p className="text-sm text-muted-foreground">Tente buscar por outros termos</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user: any) => (
                    <TableRow key={user.id} className="border-b border-[#E5E2DD] last:border-b-0">
                      <TableCell className="text-sm font-medium py-3.5">
                        #{user.id}
                      </TableCell>
                      <TableCell className="text-sm py-3.5">
                        {user.attributes.email}
                      </TableCell>
                      <TableCell className="text-sm py-3.5 text-muted-foreground">
                        {user.attributes.name === "-" ? "Não informado" : user.attributes.name}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-sm font-medium ${getRoleBadgeStyle(user.attributes.role)}`}>
                          {getRoleLabel(user.attributes.role)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-sm rounded-md border border-gray-300 cursor-pointer hover:bg-primary hover:text-white"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-sm rounded-md border border-red-400 text-red-600 cursor-pointer hover:bg-red-600 hover:text-white"
                            onClick={() => handleConfirmDeleteUser(user)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Excluir
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
          {filteredUsers.length > 0 && (
            <div className="px-5 py-3 border-t border-[#E5E2DD] flex items-center justify-between text-sm text-muted-foreground">
              <span>Mostrando {filteredUsers.length} de {users.length} usuários</span>
              <span>Total de usuários: {users.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal de usuario */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
        user={selectedUser}
        users={users}
        isEdit={isEditing}
        loading={loading}
        initialDeleteConfirm={initialDeleteConfirm}
      />
    </div>
  );
}
