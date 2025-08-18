import { ShoppingCart, Settings, Target, BarChart3, Headset, BookOpen } from "lucide-react";

export const dashboardCards = [
  {
    href: "/admin/pedidos",
    icon: ShoppingCart,
    title: "Pedidos",
    description: "Gerencie os pedidos da sua loja",
    iconBgColor: "bg-blue-500"
  },
  {
    href: "/admin/catalog",
    icon: BookOpen,
    title: "Catálogo",
    description: "Gerencie seu catálogo",
    iconBgColor: "bg-emerald-600"
  },
  {
    href: "/admin/settings",
    icon: Settings,
    title: "Configurações",
    description: "Configure sua loja",
    iconBgColor: "bg-gray-600"
  },
  {
    href: "#marketing",
    icon: Target,
    title: "Marketing",
    description: "Estamos trabalhando nisso",
    
    iconBgColor: "bg-red-500"
  },
  {
    href: "#relatorios",
    icon: BarChart3,
    title: "Relatórios",
    description: "Acompanhe suas métricas",
    iconBgColor: "bg-purple-500"
  },
  {
    href: "/admin/suporte",
    icon: Headset,
    title: "Suporte",
    description: "Área de atendimento e auxílio ao lojista",
    iconBgColor: "bg-yellow-500"
  }
];
