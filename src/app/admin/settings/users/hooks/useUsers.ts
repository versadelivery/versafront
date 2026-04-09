import { useState, useEffect } from "react";
import { userService, User, CreateUserRequest, UpdateUserRequest } from "../services/userService";

// Hook para gerenciar usuários
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar usuários da API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários');
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar usuários na inicialização
  useEffect(() => {
    fetchUsers();
  }, []);

  // Criar novo usuário
  const createUser = async (userData: CreateUserRequest['user']) => {
    try {
      setError(null);
      const response = await userService.createUser({ user: userData });
      await fetchUsers(); // Recarregar lista
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao criar usuário';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Atualizar usuário
  const updateUser = async (userId: string, userData: UpdateUserRequest['user']) => {
    try {
      setError(null);
      const response = await userService.updateUser(userId, { user: userData });
      await fetchUsers(); // Recarregar lista
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar usuário';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Deletar usuário
  const deleteUser = async (userId: string) => {
    try {
      setError(null);
      await userService.deleteUser(userId);
      await fetchUsers(); // Recarregar lista
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao deletar usuário';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Obter usuário por ID
  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  // Mapear role para nome em português
  const getRoleName = (role: string) => {
    const roleMap = {
      'owner': 'Proprietário',
      'manager': 'Gerente',
      'employee': 'Funcionário', 
      'delivery_man': 'Entregador'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    getRoleName,
    refetch: fetchUsers
  };
}
