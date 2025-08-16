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
  Users
} from "lucide-react";
import AdminHeader from "@/components/admin/catalog-header";

// Dados mockados para demonstração
const mockUsers = [
  {
    id: "921610",
    email: "mattheusgoijs@gmail.com", 
    name: "-",
    type: "Gerente",
    status: "active"
  }
];

export default function UsersManagementPage() {
  const [users] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user: any) => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.includes(searchTerm)
  );

  const getUserTypeColor = (type: string) => {
    switch(type) {
      case "Administrador":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "Gerente":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
      case "Funcionário":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
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
                        {user.email}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-muted-foreground">
                          {user.name === "-" ? "Não informado" : user.name}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant="secondary" 
                          className={`${getUserTypeColor(user.type)} border-0`}
                        >
                          {user.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 px-3 text-xs border-muted hover:bg-primary hover:text-white"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
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
    </div>
  );
}
