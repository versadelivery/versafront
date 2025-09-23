"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Store, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  UserCheck
} from "lucide-react";
import Link from "next/link";

// Mock data - substitua pelos dados reais da API
const dashboardStats = {
  totalMerchants: 156,
  pendingApprovals: 12,
  totalRevenue: 145670.50,
  activeStores: 134,
  monthlyGrowth: 15.3
};

const pendingMerchants = [
  {
    id: 1,
    storeName: "Pizzaria Don Giovanni",
    ownerName: "João Silva",
    email: "joao@dongiovanni.com",
    phone: "(11) 99999-9999",
    submittedAt: "2024-01-15",
    status: "pending"
  },
  {
    id: 2,
    storeName: "Burger House",
    ownerName: "Maria Santos",
    email: "maria@burgerhouse.com",
    phone: "(11) 88888-8888",
    submittedAt: "2024-01-14",
    status: "pending"
  },
  {
    id: 3,
    storeName: "Sushi Express",
    ownerName: "Carlos Yamamoto",
    email: "carlos@sushiexpress.com",
    phone: "(11) 77777-7777",
    submittedAt: "2024-01-13",
    status: "under_review"
  }
];

const recentActivity = [
  {
    id: 1,
    action: "Nova loja aprovada",
    description: "Cantina da Vovó foi aprovada e está ativa",
    timestamp: "2 horas atrás",
    type: "approval"
  },
  {
    id: 2,
    action: "Solicitação de cadastro",
    description: "Pizzaria Don Giovanni enviou solicitação",
    timestamp: "4 horas atrás",
    type: "request"
  },
  {
    id: 3,
    action: "Relatório gerado",
    description: "Relatório mensal de dezembro finalizado",
    timestamp: "1 dia atrás",
    type: "report"
  }
];

export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-2">Visão geral da plataforma e solicitações pendentes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Lojistas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalMerchants}</div>
              <p className="text-xs text-muted-foreground">
                +{dashboardStats.monthlyGrowth}% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovações Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{dashboardStats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando revisão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lojas Ativas</CardTitle>
              <Store className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboardStats.activeStores}</div>
              <p className="text-xs text-muted-foreground">
                De {dashboardStats.totalMerchants} cadastradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                R$ {dashboardStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Solicitações Pendentes
                </CardTitle>
                <CardDescription>
                  Lojistas aguardando aprovação para completar o cadastro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingMerchants.map((merchant) => (
                    <div key={merchant.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{merchant.storeName}</h4>
                          <Badge 
                            variant={merchant.status === 'pending' ? 'destructive' : 'secondary'}
                          >
                            {merchant.status === 'pending' ? 'Pendente' : 'Em Análise'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{merchant.ownerName}</p>
                        <p className="text-sm text-gray-500">{merchant.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Enviado em {new Date(merchant.submittedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link href="/super-admin/merchants">
                    <Button variant="outline" className="w-full">
                      Ver Todas as Solicitações
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'approval' ? 'bg-green-100' :
                        activity.type === 'request' ? 'bg-orange-100' :
                        'bg-blue-100'
                      }`}>
                        {activity.type === 'approval' ? 
                          <CheckCircle className="h-4 w-4 text-green-600" /> :
                          activity.type === 'request' ?
                          <AlertCircle className="h-4 w-4 text-orange-600" /> :
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 gap-3">
                <Link href="/super-admin/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </Link>
                <Link href="/super-admin/merchants">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Lojistas
                  </Button>
                </Link>
                <Link href="/super-admin/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}