"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { X, User, Mail, Shield, Loader2 } from "lucide-react";
import { User as UserType } from "../services/userService";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => Promise<void>;
  onDelete?: (userId: string) => Promise<void>;
  user?: UserType | null;
  isEdit?: boolean;
  loading?: boolean;
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
  isEdit = false,
  loading = false 
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
    setShowDeleteConfirm(false);
  }, [isEdit, user, isOpen]);

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
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !onDelete) return;
    
    setIsSubmitting(true);
    try {
      await onDelete(user.id);
      onClose();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
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
    const colors = {
      owner: "text-red-600",
      manager: "text-emerald-600", 
      employee: "text-blue-600",
      delivery_man: "text-purple-600"
    };
    return colors[role as keyof typeof colors] || "text-gray-600";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {isEdit ? "Editar Usuário" : "Criar Novo Usuário"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isEdit ? "Atualize as informações do usuário" : "Preencha os dados para criar um novo usuário"}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {showDeleteConfirm ? (
            /* Confirmação de exclusão */
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirmar Exclusão
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tem certeza que deseja excluir o usuário <strong>{user?.attributes.name}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-11"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleDelete}
                  className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white"
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
            /* Formulário */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Nome completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ex: João Silva"
                    value={formData.name}
                    onChange={(e: any) => handleChange("name", e.target.value)}
                    className={`pl-10 h-11 ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    value={formData.email}
                    onChange={(e: any) => handleChange("email", e.target.value)}
                    className={`pl-10 h-11 ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Função */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Função
                </Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleChange("role", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={`h-11 ${errors.role ? "border-red-500" : ""}`}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Selecione a função" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
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
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e: any) => handleChange("password", e.target.value)}
                      className={`h-11 ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
                      disabled={isSubmitting}
                    />
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                      Confirmar senha
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Digite a senha novamente"
                      value={formData.confirmPassword}
                      onChange={(e: any) => handleChange("confirmPassword", e.target.value)}
                      className={`h-11 ${errors.confirmPassword ? "border-red-500 focus:border-red-500" : ""}`}
                      disabled={isSubmitting}
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                {isEdit && onDelete && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    disabled={isSubmitting}
                  >
                    Excluir
                  </Button>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1 h-11"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
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
      </Card>
    </div>
  );
}
