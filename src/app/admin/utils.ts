import { getVisibleAdminSections } from "@/lib/permissions"

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
  "mesas",
]

export function getDashboardCards(permissions?: string[] | null) {
  const visibleSections = getVisibleAdminSections(permissions)

  return dashboardSectionIds
    .map((id) => visibleSections.find((s) => s.id === id))
    .filter(Boolean)
    .map((s) => ({
      href: s!.href,
      icon: s!.icon,
      title: s!.title,
      description: s!.description,
      iconBgColor: s!.iconBgColor,
    }))
}

export const dashboardCards = getDashboardCards(undefined)
