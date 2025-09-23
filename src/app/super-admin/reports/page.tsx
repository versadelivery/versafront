"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Users,
  Store,
  PieChart,
  LineChart
} from "lucide-react";

// Mock data para os gráficos - substitua pelos dados reais
const monthlyData = [
  { month: 'Jan', revenue: 12500, orders: 145, merchants: 12 },
  { month: 'Fev', revenue: 15300, orders: 178, merchants: 15 },
  { month: 'Mar', revenue: 18700, orders: 203, merchants: 18 },
  { month: 'Abr', revenue: 22100, orders: 234, merchants: 22 },
  { month: 'Mai', revenue: 25600, orders: 267, merchants: 25 },
  { month: 'Jun', revenue: 28900, orders: 289, merchants: 28 }
];

const topMerchants = [
  { name: "Pizzaria Don Giovanni", revenue: 5600, orders: 89 },
  { name: "Burger House", revenue: 4800, orders: 72 },
  { name: "Sushi Express", revenue: 4200, orders: 61 },
  { name: "Cantina da Vovó", revenue: 3900, orders: 58 },
  { name: "Tacos Locos", revenue: 3500, orders: 52 }
];

const categoryData = [
  { category: "Pizzaria", percentage: 35, revenue: 45600 },
  { category: "Hamburgueria", percentage: 25, revenue: 32400 },
  { category: "Japonesa", percentage: 20, revenue: 25900 },
  { category: "Italiana", percentage: 12, revenue: 15600 },
  { category: "Mexicana", percentage: 8, revenue: 10400 }
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last_30_days");
  const [reportType, setReportType] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Relatórios e Análises</h1>
          <p className="text-gray-600 mt-2">Visualize métricas e gere relatórios da plataforma</p>
        </div>

        {/* Filters and Export */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="report-type">Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Visão Geral</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                    <SelectItem value="merchants">Lojistas</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date-range">Período</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
                    <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
                    <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
                    <SelectItem value="last_6_months">Últimos 6 meses</SelectItem>
                    <SelectItem value="last_year">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="start-date">Data Inicial</Label>
                <Input type="date" id="start-date" />
              </div>
              
              <div className="flex items-end">
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 129.850</div>
              <p className="text-xs text-muted-foreground">
                +20.1% em relação ao período anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +15.3% em relação ao período anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lojistas Ativos</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">
                +3 novos lojistas este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 105,20</div>
              <p className="text-xs text-muted-foreground">
                +5.2% em relação ao período anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Evolução da Receita
              </CardTitle>
              <CardDescription>Receita mensal nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder para gráfico - use uma biblioteca como Recharts */}
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Gráfico de Receita Mensal</p>
                    <p className="text-sm text-gray-400">Use Recharts ou Chart.js aqui</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">R$ 28.900</p>
                    <p className="text-gray-500">Este Mês</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">R$ 25.600</p>
                    <p className="text-gray-500">Mês Anterior</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-green-600">+12.9%</p>
                    <p className="text-gray-500">Crescimento</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribuição por Categoria
              </CardTitle>
              <CardDescription>Receita por tipo de estabelecimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder para gráfico de pizza */}
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Gráfico de Pizza</p>
                    <p className="text-sm text-gray-400">Distribuição por categoria</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-blue-${(index + 3) * 100}`}></div>
                        <span className="text-sm">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{category.percentage}%</div>
                        <div className="text-xs text-gray-500">
                          R$ {category.revenue.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Merchants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top 5 Lojistas
            </CardTitle>
            <CardDescription>Lojistas com melhor desempenho no período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMerchants.map((merchant, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{merchant.name}</p>
                      <p className="text-sm text-gray-500">{merchant.orders} pedidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ {merchant.revenue.toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-gray-500">Receita</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}