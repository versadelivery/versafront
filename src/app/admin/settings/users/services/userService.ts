import api from "@/api/config";

export interface User {
  id: string;
  type: string;
  attributes: {
    name: string;
    email: string;
    role: 'owner' | 'employee' | 'delivery_man';
    created_at?: string;
    updated_at?: string;
    shop?: any; // Incluindo shop caso venha nos dados
  };
}

export interface CreateUserRequest {
  user: {
    name: string;
    email: string;
    password: string;
    role: 'owner' | 'employee' | 'delivery_man';
  };
}

export interface UpdateUserRequest {
  user: {
    name?: string;
    email?: string;
    role?: 'owner' | 'employee' | 'delivery_man';
  };
}

export interface UsersResponse {
  data: User[];
}

export interface UserResponse {
  data: User;
}

export const userService = {
  // Listar todos os usuários
  getUsers: async (): Promise<UsersResponse> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Obter um usuário específico
  getUser: async (id: string): Promise<UserResponse> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Criar novo usuário
  createUser: async (userData: CreateUserRequest): Promise<UserResponse> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Atualizar usuário
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<UserResponse> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Deletar usuário
  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
