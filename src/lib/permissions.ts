import { adminSections, type AdminSection } from "@/lib/admin-sections"

export type PermissionKey =
  | "app.access"
  | "orders.view"
  | "orders.manage"
  | "pdv.manage"
  | "customers.manage"
  | "tables.manage"
  | "cash_register.manage"
  | "catalog.manage"
  | "marketing.manage"
  | "reports.view"
  | "settings.manage"
  | "users.manage"
  | "finance.view"

export type PermissionPresetKey = "garcom" | "cozinheiro" | "caixa" | "atendimento" | "estoque" | "gerente"

export interface PermissionDefinition {
  key: PermissionKey
  label: string
  description: string
  group: string
}

export interface PermissionPreset {
  key: PermissionPresetKey
  label: string
  description: string
  permissions: PermissionKey[]
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  { key: "app.access", label: "Acesso ao app", description: "Permite entrar no painel administrativo", group: "Base" },
  { key: "orders.view", label: "Ver pedidos", description: "Listar e acompanhar pedidos", group: "Operações" },
  { key: "orders.manage", label: "Gerenciar pedidos", description: "Alterar status, editar e cancelar pedidos", group: "Operações" },
  { key: "pdv.manage", label: "Usar PDV", description: "Criar pedidos manualmente no balcão", group: "Operações" },
  { key: "customers.manage", label: "Gerenciar clientes", description: "Criar, editar e consultar clientes", group: "Cadastros" },
  { key: "tables.manage", label: "Gerenciar mesas", description: "Abrir, fechar e operar mesas/comandas", group: "Operações" },
  { key: "cash_register.manage", label: "Gerenciar caixa", description: "Abrir, fechar e lançar movimentações", group: "Financeiro" },
  { key: "catalog.manage", label: "Gerenciar cardápio", description: "Editar grupos, itens, complementos e ingredientes", group: "Cadastros" },
  { key: "marketing.manage", label: "Marketing", description: "Usar cupons, QR code, PDF e avaliações", group: "Marketing" },
  { key: "reports.view", label: "Ver relatórios", description: "Acessar relatórios e indicadores", group: "Relatórios" },
  { key: "settings.manage", label: "Configurações", description: "Alterar configurações gerais e operacionais", group: "Configurações" },
  { key: "users.manage", label: "Gerenciar equipe", description: "Criar, editar e configurar funcionários", group: "Configurações" },
  { key: "finance.view", label: "Financeiro", description: "Visualizar cobranças e plano da loja", group: "Financeiro" },
]

export const PERMISSION_PRESETS: PermissionPreset[] = [
  {
    key: "garcom",
    label: "Garçom",
    description: "Atendimento de salão e operação básica",
    permissions: ["app.access", "orders.view", "orders.manage", "tables.manage"],
  },
  {
    key: "cozinheiro",
    label: "Cozinheiro",
    description: "Fila de produção e atualização de pedidos",
    permissions: ["app.access", "orders.view", "orders.manage"],
  },
  {
    key: "caixa",
    label: "Caixa",
    description: "PDV e caixa com foco financeiro operacional",
    permissions: ["app.access", "orders.view", "pdv.manage", "cash_register.manage", "customers.manage"],
  },
  {
    key: "atendimento",
    label: "Atendimento",
    description: "Operação geral de pedidos, cliente e balcão",
    permissions: ["app.access", "orders.view", "orders.manage", "customers.manage", "pdv.manage"],
  },
  {
    key: "estoque",
    label: "Estoque",
    description: "Cardápio, itens e ingredientes",
    permissions: ["app.access", "catalog.manage"],
  },
  {
    key: "gerente",
    label: "Gerente",
    description: "Acesso amplo de operação e gestão",
    permissions: [
      "app.access",
      "orders.view",
      "orders.manage",
      "pdv.manage",
      "customers.manage",
      "tables.manage",
      "cash_register.manage",
      "catalog.manage",
      "marketing.manage",
      "reports.view",
      "settings.manage",
      "users.manage",
      "finance.view",
    ],
  },
]

export const ADMIN_SECTION_PERMISSIONS: Record<string, PermissionKey | null> = {
  dashboard: null,
  pedidos: "orders.view",
  catalogo: "catalog.manage",
  financeiro: "finance.view",
  caixa: "cash_register.manage",
  pdv: "pdv.manage",
  clientes: "customers.manage",
  marketing: "marketing.manage",
  "marketing-coupons": "marketing.manage",
  "marketing-qrcode": "marketing.manage",
  "marketing-pdf-catalog": "marketing.manage",
  "marketing-reviews": "marketing.manage",
  mesas: "tables.manage",
  relatorios: "reports.view",
  "relatorios-resumo-semanal": "reports.view",
  "relatorios-vendas-periodo": "reports.view",
  "relatorios-faturamento-mensal": "reports.view",
  "relatorios-ticket-medio": "reports.view",
  "relatorios-formas-pagamento": "reports.view",
  "relatorios-descontos": "reports.view",
  "relatorios-vendas-por-item": "reports.view",
  "relatorios-vendas-horario": "reports.view",
  "relatorios-vendas-dia-semana": "reports.view",
  "relatorios-vendas-bairro": "reports.view",
  "relatorios-vendas-canal": "reports.view",
  "relatorios-tempo-preparo": "reports.view",
  "relatorios-tempo-entrega": "reports.view",
  "relatorios-top-clientes": "reports.view",
  "relatorios-aquisicao-clientes": "reports.view",
  "relatorios-lucratividade": "reports.view",
  "relatorios-extrato-caixa": "reports.view",
  "relatorios-cupons-utilizados": "reports.view",
  "relatorios-por-atendente": "reports.view",
  "relatorios-visitantes": "reports.view",
  "relatorios-taxas-entrega": "reports.view",
  "relatorios-itens-alterados": "reports.view",
  "relatorios-pagamento-alterado": "reports.view",
  suporte: "app.access",
  settings: "settings.manage",
  "settings-general": "settings.manage",
  "settings-appearance": "settings.manage",
  "settings-users": "users.manage",
  "settings-delivery": "settings.manage",
  "settings-payment": "settings.manage",
  "order-flow": "settings.manage",
}

export function hasPermission(permissions: string[] | undefined | null, permission: PermissionKey): boolean {
  if (!permissions) return true
  return permissions.includes(permission)
}

export function getPresetByPermissions(permissions: string[] | undefined | null): PermissionPresetKey | "custom" {
  if (!permissions) return "atendimento"

  const normalized = permissions.slice().sort().join("|")
  const preset = PERMISSION_PRESETS.find((item) => item.permissions.slice().sort().join("|") === normalized)
  return preset?.key || "custom"
}

export function getPermissionsForPreset(preset: PermissionPresetKey): PermissionKey[] {
  return [...(PERMISSION_PRESETS.find((item) => item.key === preset)?.permissions || [])]
}

export function getVisibleAdminSections(permissions: string[] | undefined | null): AdminSection[] {
  if (!permissions) return adminSections

  return adminSections.filter((section) => {
    const requiredPermission = ADMIN_SECTION_PERMISSIONS[section.id]
    if (!requiredPermission) return true
    return hasPermission(permissions, requiredPermission)
  })
}

export function groupPermissionDefinitions() {
  return PERMISSION_DEFINITIONS.reduce<Record<string, PermissionDefinition[]>>((acc, permission) => {
    acc[permission.group] ||= []
    acc[permission.group].push(permission)
    return acc
  }, {})
}
