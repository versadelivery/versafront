"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  X,
  User,
  Mail,
  Shield,
  Loader2,
  Check,
  Sparkles,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { User as UserType } from "../services/userService";
import {
  PERMISSION_PRESETS,
  getPermissionsForPreset,
  getPresetByPermissions,
  groupPermissionDefinitions,
  type PermissionKey,
  type PermissionPresetKey,
} from "@/lib/permissions";

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
    description: "Acesso total ao sistema",
  },
  {
    value: "employee",
    label: "Funcionário",
    description: "Acesso configurável por perfil",
  },
  {
    value: "delivery_man",
    label: "Entregador",
    description: "Gestão de entregas e pedidos",
  },
] as const;

const permissionPresetLabels: Record<PermissionPresetKey | "custom", string> = {
  garcom: "Garçom",
  cozinheiro: "Cozinheiro",
  caixa: "Caixa",
  atendimento: "Atendimento",
  estoque: "Estoque",
  gerente: "Gerente",
  custom: "Personalizado",
};

function uniquePermissions(permissions: PermissionKey[]) {
  return Array.from(new Set(permissions));
}

function ensureEmployeeBaseAccess(permissions: PermissionKey[]) {
  const normalized = uniquePermissions(permissions);
  return normalized.includes("app.access")
    ? normalized
    : (["app.access", ...normalized] as PermissionKey[]);
}

export default function UserModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  user,
  users = [],
  isEdit = false,
  loading = false,
  initialDeleteConfirm = false,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedPreset, setSelectedPreset] = useState<PermissionPresetKey | "custom">("atendimento");
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>(getPermissionsForPreset("atendimento"));
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const groupedPermissions = useMemo(() => groupPermissionDefinitions(), []);
  const isLastOwner = isEdit && user?.attributes.role === "owner" && users.filter((u) => u.attributes.role === "owner").length <= 1;
  const isBusy = isSubmitting || loading;
  const isEmployee = formData.role === "employee";
  const isOwner = formData.role === "owner";
  const isDeliveryMan = formData.role === "delivery_man";

  useEffect(() => {
    if (isEdit && user) {
      const existingPermissions = (user.attributes.permissions || []) as PermissionKey[];
      const resolvedPreset = user.attributes.permission_profile
        ? (user.attributes.permission_profile as PermissionPresetKey | "custom")
        : getPresetByPermissions(existingPermissions);
      const permissionsToUse = existingPermissions.length > 0
        ? existingPermissions
        : getPermissionsForPreset("atendimento");

      setFormData({
        name: user.attributes.name || "",
        email: user.attributes.email || "",
        role: user.attributes.role || "",
        password: "",
        confirmPassword: "",
      });
      setSelectedPreset(resolvedPreset);
      setSelectedPermissions(user.attributes.role === "employee"
        ? ensureEmployeeBaseAccess(permissionsToUse)
        : []);
    } else {
      setFormData({
        name: "",
        email: "",
        role: "",
        password: "",
        confirmPassword: "",
      });
      setSelectedPreset("atendimento");
      setSelectedPermissions(getPermissionsForPreset("atendimento"));
    }
    setErrors({});
    setShowDeleteConfirm(initialDeleteConfirm);
  }, [isEdit, user, isOpen, initialDeleteConfirm]);

  if (!isOpen) return null;

  const setRole = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
    setErrors((prev) => ({ ...prev, role: "" }));

    if (value === "employee") {
      const defaultPermissions = getPermissionsForPreset("atendimento");
      setSelectedPreset("atendimento");
      setSelectedPermissions(defaultPermissions);
      return;
    }

    setSelectedPreset("custom");
    setSelectedPermissions([]);
  };

  const applyPreset = (preset: PermissionPresetKey | "custom") => {
    if (preset === "custom") {
      setSelectedPreset("custom");
      return;
    }

    const permissions = getPermissionsForPreset(preset);
    setSelectedPreset(preset);
    setSelectedPermissions(ensureEmployeeBaseAccess(permissions));
    setErrors((prev) => ({ ...prev, permissions: "" }));
  };

  const togglePermission = (permission: PermissionKey, checked: boolean) => {
    if (!isEmployee) return;
    if (permission === "app.access") return;

    const nextPermissions = checked
      ? [...selectedPermissions, permission]
      : selectedPermissions.filter((item) => item !== permission);
    const normalized = ensureEmployeeBaseAccess(nextPermissions);

    setSelectedPermissions(normalized);
    setSelectedPreset(getPresetByPermissions(normalized));
    setErrors((prev) => ({ ...prev, permissions: "" }));
  };

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

    if (isEdit && isLastOwner && formData.role !== "owner") {
      newErrors.role = "Não é possível alterar a função do último proprietário";
    }

    if (isEmployee && !selectedPermissions.includes("app.access")) {
      newErrors.permissions = "O funcionário precisa ter acesso ao app";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userData: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (!isEdit) {
        userData.password = formData.password;
      }

      if (isEmployee) {
        userData.permissions = ensureEmployeeBaseAccess(selectedPermissions);
      }

      await onSave(userData);
      onClose();
    } catch (error: any) {
      const message = error.message || "";
      if (message.toLowerCase().includes("email") || message.toLowerCase().includes("e-mail") || message.toLowerCase().includes("already") || message.toLowerCase().includes("já")) {
        setErrors((prev) => ({ ...prev, email: "Este e-mail já está cadastrado" }));
      } else {
        toast.error(message || "Erro ao salvar usuário");
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
      toast.error(error.message || "Erro ao deletar usuário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-md border border-[#E5E2DD] overflow-hidden flex flex-col max-h-[90vh]">
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

        <div className="flex-1 overflow-y-auto bg-[#FAF9F7] px-5 py-5">
          {showDeleteConfirm ? (
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
                  disabled={isBusy}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex-1 h-10 rounded-md border border-gray-300 cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                  disabled={isBusy}
                >
                  {isBusy ? (
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    maxLength={30}
                    className={`pl-10 h-10 rounded-md border-[#E5E2DD] ${errors.name ? "border-red-400 focus:border-red-400" : ""}`}
                    disabled={isBusy}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

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
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className={`pl-10 h-10 rounded-md border-[#E5E2DD] ${errors.email ? "border-red-400 focus:border-red-400" : ""}`}
                    disabled={isBusy}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Função</Label>
                <Select value={formData.role} onValueChange={setRole} disabled={isBusy}>
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
                          <span className="font-medium">{role.label}</span>
                          <span className="text-xs text-muted-foreground">{role.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
              </div>

              {isEmployee && (
                <div className="space-y-4 rounded-md border border-[#E5E2DD] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Permissões do funcionário</p>
                      <p className="text-xs text-muted-foreground">
                        Escolha um perfil inicial e ajuste manualmente o que cada pessoa pode usar.
                      </p>
                    </div>
                    <Badge variant="outline" className="border-[#E5E2DD] bg-[#FAF9F7] text-xs">
                      {permissionPresetLabels[selectedPreset]}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Perfil rápido</Label>
                    <Select value={selectedPreset} onValueChange={(value) => applyPreset(value as PermissionPresetKey | "custom")} disabled={isBusy}>
                      <SelectTrigger className="h-10 rounded-md border-[#E5E2DD] cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Escolha um perfil" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-md border border-[#E5E2DD]">
                        {PERMISSION_PRESETS.map((preset) => (
                          <SelectItem key={preset.key} value={preset.key}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{preset.label}</span>
                              <span className="text-xs text-muted-foreground">{preset.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Personalizado</span>
                            <span className="text-xs text-muted-foreground">Ajuste manualmente as permissões</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(groupedPermissions).map(([group, permissions]) => (
                      <div key={group} className="space-y-2 rounded-md border border-[#E5E2DD] bg-[#FAF9F7] p-3">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium text-gray-900">{group}</p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {permissions.map((permission) => {
                            const checked = selectedPermissions.includes(permission.key)
                            const disabled = permission.key === "app.access"

                            return (
                              <label key={permission.key} className="flex items-start gap-3 rounded-md border border-white bg-white p-3 shadow-sm">
                                <Checkbox
                                  checked={checked}
                                  disabled={disabled || isBusy}
                                  onCheckedChange={(value) => togglePermission(permission.key, value === true)}
                                  className="mt-0.5"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    {disabled && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                                    <span className="text-sm font-medium text-gray-900">{permission.label}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{permission.description}</p>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {errors.permissions && <p className="text-xs text-red-500">{errors.permissions}</p>}
                </div>
              )}

              {isOwner && (
                <div className="rounded-md border border-[#E5E2DD] bg-white p-4 text-sm text-muted-foreground">
                  Proprietário tem acesso total e não precisa de perfil adicional.
                </div>
              )}

              {isDeliveryMan && (
                <div className="rounded-md border border-[#E5E2DD] bg-white p-4 text-sm text-muted-foreground">
                  Entregador mantém o fluxo próprio de entregas.
                </div>
              )}

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
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      className={`h-10 rounded-md border-[#E5E2DD] ${errors.password ? "border-red-400 focus:border-red-400" : ""}`}
                      disabled={isBusy}
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
                      onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`h-10 rounded-md border-[#E5E2DD] ${errors.confirmPassword ? "border-red-400 focus:border-red-400" : ""}`}
                      disabled={isBusy}
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}

              <div className="flex items-center gap-3 pt-3">
                {isEdit && onDelete && !isLastOwner && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="h-10 px-4 rounded-md border border-red-400 text-red-600 cursor-pointer hover:bg-red-600 hover:text-white text-sm"
                    disabled={isBusy}
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
                  disabled={isBusy}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-10 px-5 rounded-md border border-gray-300 cursor-pointer bg-primary text-white hover:bg-primary/90 text-sm"
                  disabled={isBusy}
                >
                  {isBusy ? (
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
