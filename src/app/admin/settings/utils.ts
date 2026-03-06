import { Settings, Users, Truck, CreditCard, Bell, Palette } from "lucide-react";

export const settingsCards = [
  {
    href: "/admin/settings/general",
    icon: Settings,
    title: "Informações Gerais",
    description: "Configure as configurações básicas do sistema",
    iconBgColor: "bg-blue-500"
  },
  {
    href: "/admin/settings/appearance",
    icon: Palette,
    title: "Aparência do Cardápio",
    description: "Cores, layout, mensagem de boas-vindas e banner",
    iconBgColor: "bg-pink-500"
  },
  {
    href: "/admin/settings/users",
    icon: Users,
    title: "Gerenciamento de Usuários",
    description: "Gerencie permissões e acessos dos usuários",
    iconBgColor: "bg-emerald-600"
  },
  {
    href: "/admin/settings/delivery",
    icon: Truck,
    title: "Taxas de Entrega",
    description: "Configure a taxa de entrega e as zonas de entrega",
    iconBgColor: "bg-red-500"
  },
  {
    href: "/admin/settings/payment",
    icon: CreditCard,
    title: "Meios de Pagamento",
    description: "Configure os meios de pagamento disponíveis",
    iconBgColor: "bg-purple-500"
  },
  {
    href: "/admin/settings/notifications",
    icon: Bell,
    title: "Notificações",
    description: "Configure os templates de mensagem WhatsApp",
    iconBgColor: "bg-green-600"
  },
];