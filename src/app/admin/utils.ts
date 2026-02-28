import { adminSections } from "@/lib/admin-sections"

const dashboardSectionIds = [
  "pedidos",
  "catalogo",
  "clientes",
  "financeiro",
  "settings",
  "marketing",
  "relatorios",
  "suporte",
  "caixa",
]

export const dashboardCards = dashboardSectionIds
  .map((id) => adminSections.find((s) => s.id === id))
  .filter(Boolean)
  .map((s) => ({
    href: s!.href,
    icon: s!.icon,
    title: s!.title,
    description: s!.description,
    iconBgColor: s!.iconBgColor,
  }))
