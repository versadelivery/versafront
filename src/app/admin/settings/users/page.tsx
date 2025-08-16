"use client";

import { useState } from "react";
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
  TableRow 
} from "@/components/ui/table";
import { 
  UserPlus, 
  Search, 
  Edit, 
  Users,
  Trash2
} from "lucide-react";
import AdminHeader from "@/components/admin/catalog-header";
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const filteredUsers = users.filter((user: any) => 
    user.attributes.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      owner: "bg-red-100 text-red-700",
      manager: "bg-emerald-100 text-emerald-700",
      employee: "bg-blue-100 text-blue-700",
      delivery_man: "bg-purple-100 text-purple-700"
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      owner: "Proprietário",
      manager: "Gerente", 
      employee: "Funcionário",
      delivery_man: "Entregador"
    };
    return labels[role as keyof typeof labels] || role;
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditing(true);
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

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 min-h-screen pb-20">
      <AdminHeader
        title="GERENCIAMENTO DE USUÁRIOS"
        description="Gerencie permissões e acessos dos usuários do sistema"
        className="mb-4"
      />
      
      <div className="w-full max-w-7xl mx-auto p-0 md:p-4 lg:p-6 bg-white">
        <Card className="p-4 md:p-6 shadow-none border-none rounded-xs bg-white">
          {/* Header da tabela com busca e botão de criar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por ID, email ou nome..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-muted"
              />
            </div>
            
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 h-12 gap-2"
              onClick={handleCreateUser}
            >
              <UserPlus className="h-4 w-4" />
              + Criar novo usuário
            </Button>
          </div>

          {/* Tabela de usuários */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground py-4">ID</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">E-mail</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Nome</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Tipo</TableHead>
                  <TableHead className="font-semibold text-foreground py-4 text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p>Nenhum usuário encontrado</p>
                        {searchTerm && (
                          <p className="text-sm">Tente buscar por outros termos</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user: any) => (
                    <TableRow key={user.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium py-4">
                        #{user.id}
                      </TableCell>
                      <TableCell className="py-4">
                        {user.attributes.email}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-muted-foreground">
                          {user.attributes.name === "-" ? "Não informado" : user.attributes.name}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant="secondary" 
                          className={`${getRoleBadgeColor(user.attributes.role)} border-0`}
                        >
                          {getRoleLabel(user.attributes.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 px-3 text-xs border-muted hover:bg-primary hover:text-white"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
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

          {/* Rodapé com informações */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
              <div>
                Mostrando {filteredUsers.length} de {users.length} usuários
              </div>
              <div className="flex items-center gap-4">
                <span>Total de usuários: {users.length}</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modal de usuário */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
        user={selectedUser}
        isEdit={isEditing}
        loading={loading}
      />
    </div>
  );
}
