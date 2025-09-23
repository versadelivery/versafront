"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Store,
  Phone,
  Mail,
  Calendar,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data - substitua pelos dados reais da API
const merchants = [
  {
    id: 1,
    storeName: "Pizzaria Don Giovanni",
    ownerName: "João Silva",
    email: "joao@dongiovanni.com",
    phone: "(11) 99999-9999",
    submittedAt: "2024-01-15",
    status: "pending",
    category: "Pizzaria",
    address: "Rua das Flores, 123 - São Paulo, SP"
  },
  {
    id: 2,
    storeName: "Burger House",
    ownerName: "Maria Santos",
    email: "maria@burgerhouse.com",
    phone: "(11) 88888-8888",
    submittedAt: "2024-01-14",
    status: "approved",
    category: "Hamburgueria",
    address: "Av. Paulista, 456 - São Paulo, SP"
  },
  {
    id: 3,
    storeName: "Sushi Express",
    ownerName: "Carlos Yamamoto",
    email: "carlos@sushiexpress.com",
    phone: "(11) 77777-7777",
    submittedAt: "2024-01-13",
    status: "under_review",
    category: "Japonesa",
    address: "Rua Liberdade, 789 - São Paulo, SP"
  },
  {
    id: 4,
    storeName: "Cantina da Vovó",
    ownerName: "Ana Costa",
    email: "ana@cantinadavovo.com",
    phone: "(11) 66666-6666",
    submittedAt: "2024-01-12",
    status: "approved",
    category: "Italiana",
    address: "Rua dos Pinheiros, 321 - São Paulo, SP"
  },
  {
    id: 5,
    storeName: "Tacos Locos",
    ownerName: "Roberto Martinez",
    email: "roberto@tacoslocos.com",
    phone: "(11) 55555-5555",
    submittedAt: "2024-01-11",
    status: "rejected",
    category: "Mexicana",
    address: "Rua Augusta, 654 - São Paulo, SP"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'under_review':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'approved':
      return 'Aprovado';
    case 'pending':
      return 'Pendente';
    case 'under_review':
      return 'Em Análise';
    case 'rejected':
      return 'Rejeitado';
    default:
      return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'under_review':
      return <Eye className="h-4 w-4" />;
    case 'rejected':
      return <XCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function MerchantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = selectedTab === "all" || merchant.status === selectedTab;
    
    return matchesSearch && matchesTab;
  });

  const statusCounts = {
    all: merchants.length,
    pending: merchants.filter(m => m.status === 'pending').length,
    under_review: merchants.filter(m => m.status === 'under_review').length,
    approved: merchants.filter(m => m.status === 'approved').length,
    rejected: merchants.filter(m => m.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Lojistas</h1>
          <p className="text-gray-600 mt-2">Gerencie solicitações e aprove novos lojistas</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome da loja, proprietário ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avançados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Merchants Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Lista de Lojistas
            </CardTitle>
            <CardDescription>
              Visualize e gerencie todos os lojistas cadastrados na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Todos ({statusCounts.all})</TabsTrigger>
                <TabsTrigger value="pending">Pendentes ({statusCounts.pending})</TabsTrigger>
                <TabsTrigger value="under_review">Em Análise ({statusCounts.under_review})</TabsTrigger>
                <TabsTrigger value="approved">Aprovados ({statusCounts.approved})</TabsTrigger>
                <TabsTrigger value="rejected">Rejeitados ({statusCounts.rejected})</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTab} className="mt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loja</TableHead>
                        <TableHead>Proprietário</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Data de Envio</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMerchants.map((merchant) => (
                        <TableRow key={merchant.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{merchant.storeName}</div>
                              <div className="text-sm text-gray-500">{merchant.category}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{merchant.ownerName}</div>
                              <div className="text-sm text-gray-500">{merchant.address}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3" />
                                {merchant.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3" />
                                {merchant.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3" />
                              {new Date(merchant.submittedAt).toLocaleDateString('pt-BR')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`flex items-center gap-1 ${getStatusColor(merchant.status)}`}
                              variant="outline"
                            >
                              {getStatusIcon(merchant.status)}
                              {getStatusLabel(merchant.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                {merchant.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Aprovar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Rejeitar
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}