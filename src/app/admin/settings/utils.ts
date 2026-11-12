import { LayoutTemplate, Settings, Users, Truck, CreditCard, Palette, ListOrdered, Printer, Clock, CalendarClock, ScanBarcode } from "lucide-react";

export const settingsCards = [
  {
    title: "Impressoras",
    description: "Configure cupons resumidos, completos e impressão automática",
    href: "/admin/settings/printers",
    icon: Printer,
    iconBgColor: "bg-gray-700",
  },
  {
    href: "/admin/settings/barcode",
    icon: ScanBarcode,
    title: "Leitor de Código de Barras e Balança",
    description: "Ação para código não cadastrado e formato da etiqueta da balança",
    iconBgColor: "bg-slate-600"
  },
  {
    href: "/admin/settings/general",
    icon: Settings,
    title: "Cadastro da Loja",
    description: "Nome, logo, link, endereço e contato da loja",
    iconBgColor: "bg-blue-500"
  },
  {
    href: "/admin/settings/horarios",
    icon: Clock,
    title: "Horário de Funcionamento",
    description: "Dias e horários em que a loja abre e fecha",
    iconBgColor: "bg-sky-500"
  },
  {
    href: "/admin/settings/agendamento",
    icon: CalendarClock,
    title: "Agendamento e Tempo de Entrega",
    description: "Pedidos agendados e tempo estimado de preparo e entrega",
    iconBgColor: "bg-indigo-500"
  },
  {
    href: "/admin/settings/delivery",
    icon: Truck,
    title: "Taxa de Entrega",
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
    href: "/admin/settings/users",
    icon: Users,
    title: "Gerenciamento de Usuários",
    description: "Usuários, permissões e entregador padrão",
    iconBgColor: "bg-emerald-600"
  },
  {
    href: "/admin/settings/appearance",
    icon: Palette,
    title: "Aparência da Loja",
    description: "Cores, layout, mensagem de boas-vindas e banner",
    iconBgColor: "bg-pink-500"
  },
  {
    href: "/admin/settings/templates",
    icon: LayoutTemplate,
    title: "Modelos de Loja",
    description: "Monte seu catálogo rápido escolhendo categorias, grupos e itens prontos",
    iconBgColor: "bg-teal-600"
  },
  {
    href: "/admin/settings/order-flow",
    icon: ListOrdered,
    title: "Fluxo de Pedidos",
    description: "Configure as etapas que um pedido percorre na sua loja",
    iconBgColor: "bg-orange-500"
  },
];
