import { Settings, Users, Truck, CreditCard, MessageCircle } from "lucide-react";

export const settingsCards = [
  {
    href: "/admin/settings/general",
    icon: Settings,
    title: "Informações Gerais",
    description: "Configure as configurações básicas do sistema",
    iconBgColor: "bg-blue-500"
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
    icon: MessageCircle,
    title: "Notificações",
    description: "Mensagem automática de confirmação de pedido via WhatsApp",
    iconBgColor: "bg-green-600"
  },
];