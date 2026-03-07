"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { X, User, Mail, Shield, Loader2 } from "lucide-react";
import { User as UserType } from "../services/userService";
import { toast } from "sonner";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => Promise<void>;
  onDelete?: (userId: string) => Promise<void>;
  user?: UserType | null;
  users?: UserType[];
  isEdit?: boolean;
  loading?: boolean;
  initialDeleteConfirm?: boolean;
}

const userRoles = [
  {
    value: "owner",
    label: "Proprietário",
    description: "Acesso total ao sistema"
  },
  {
    value: "manager",
    label: "Gerente",
    description: "Gerenciamento de pedidos e configurações"
  },
  {
    value: "employee",
    label: "Funcionário",
    description: "Acesso limitado para operações básicas"
  },
  {
    value: "delivery_man",
    label: "Entregador",
    description: "Gestão de entregas e pedidos"
  }
];

export default function UserModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  user,
  users = [],
  isEdit = false,
  loading = false,
  initialDeleteConfirm = false
}: UserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isLastOwner = isEdit && user?.attributes.role === 'owner' &&
    users.filter(u => u.attributes.role === 'owner').length <= 1;

  // Preencher formulário quando editando
  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        name: user.attributes.name || "",
        email: user.attributes.email || "",
        role: user.attributes.role || "",
        password: "",
        confirmPassword: ""
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "",
        password: "",
        confirmPassword: ""
      });
    }
    setErrors({});
    setShowDeleteConfirm(initialDeleteConfirm);
  }, [isEdit, user, isOpen, initialDeleteConfirm]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.role) {
      newErrors.role = "Função é obrigatória";
    }

    if (isEdit && isLastOwner && formData.role !== 'owner') {
      newErrors.role = "Não é possível alterar a função do último proprietário";
    }

    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = "Senha é obrigatória";
      } else if (formData.password.length < 6) {
        newErrors.password = "Senha deve ter pelo menos 6 caracteres";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Senhas não coincidem";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        ...((!isEdit) && { password: formData.password })
      };

      await onSave(userData);
      onClose();
    } catch (error: any) {
      const message = error.message || '';
      if (message.toLowerCase().includes('email') || message.toLowerCase().includes('e-mail') || message.toLowerCase().includes('already') || message.toLowerCase().includes('já')) {
        setErrors(prev => ({ ...prev, email: "Este e-mail já está cadastrado" }));
      } else {
        toast.error(message || 'Erro ao salvar usuário');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !onDelete) return;

    if (isLastOwner) {
      toast.error("Não é possível excluir o último proprietário da loja");
      setShowDeleteConfirm(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await onDelete(user.id);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      owner: "text-red-600",
      manager: "text-green-600",
      employee: "text-blue-600",
      delivery_man: "text-purple-600"
    };
    return colors[role] || "text-gray-600";
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-md border border-[#E5E2DD] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header fixo */}
        <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-tomato text-base font-semibold text-gray-900">
              {isEdit ? "Editar Usuário" : "Criar Novo Usuário"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-gray-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body scrollavel */}
        <div className="flex-1 overflow-y-auto bg-[#FAF9F7] px-5 py-5">
          {showDeleteConfirm ? (
            /* Confirmação de exclusão */
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-white border border-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-tomato text-base font-semibold text-gray-900 mb-2">
                  Confirmar Exclusão
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tem certeza que deseja excluir o usuário <strong className="text-gray-900">{user?.attributes.name}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-10 rounded-md border border-gray-300 cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex-1 h-10 rounded-md border border-gray-300 cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    "Confirmar Exclusão"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Formulario */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ex: João Silva"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    maxLength={30}
                    className={`pl-10 h-10 rounded-md border-[#E5E2DD] ${errors.name ? "border-red-400 focus:border-red-400" : ""}`}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`pl-10 h-10 rounded-md border-[#E5E2DD] ${errors.email ? "border-red-400 focus:border-red-400" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Funcao */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Função
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange("role", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={`h-10 rounded-md border-[#E5E2DD] cursor-pointer ${errors.role ? "border-red-400" : ""}`}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Selecione a função" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-md border border-[#E5E2DD]">
                    {userRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex flex-col items-start">
                          <span className={`font-medium ${getRoleColor(role.value)}`}>
                            {role.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {role.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
              </div>

              {/* Senhas (apenas para criação) */}
              {!isEdit && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className={`h-10 rounded-md border-[#E5E2DD] ${errors.password ? "border-red-400 focus:border-red-400" : ""}`}
                    />
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirmar senha
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Digite a senha novamente"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      className={`h-10 rounded-md border-[#E5E2DD] ${errors.confirmPassword ? "border-red-400 focus:border-red-400" : ""}`}
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}

              {/* Botoes */}
              <div className="flex items-center gap-3 pt-3">
                {isEdit && onDelete && !isLastOwner && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="h-10 px-4 rounded-md border border-red-400 text-red-600 cursor-pointer hover:bg-red-600 hover:text-white text-sm"
                    disabled={isSubmitting}
                  >
                    Excluir
                  </Button>
                )}
                <div className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-10 px-5 rounded-md border border-gray-300 cursor-pointer text-sm"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-10 px-5 rounded-md border border-gray-300 cursor-pointer bg-primary text-white hover:bg-primary/90 text-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEdit ? "Salvando..." : "Criando..."}
                    </>
                  ) : (
                    isEdit ? "Salvar alterações" : "Criar usuário"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
