"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Utensils, Settings, Target, BarChart3 } from "lucide-react";
// import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protected-route";
// import { logout } from "../lib/auth";
import Image from "next/image";
import { Header } from "@/components/admin/header";
import kifrango from "@/public/img/kifrango.png"
import bannerImg from "@/public/img/hero-admin.jpg"
import { Copy, ExternalLink } from "lucide-react";
import { AdminDashboardCard } from "@/components/admin/card";

export default function AdminDashboard() {
  // const router = useRouter();

  // const handleLogout = () => {
  //   logout();
  //   router.push('/login');
  // };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#f5f5f5]">
        <Header />

        <div className="relative">
          <div className="h-96 w-full bg-black overflow-hidden lg:rounded-b-[80px] rounded-b-md">
            <Image
              src={bannerImg}
              alt="Background"
              className="w-full h-full object-cover opacity-30"
              priority
            />
          </div>
          
          <div className="absolute top-1/2 left-1/2 transform mt-8 -translate-x-1/2 -translate-y-1/2 z-10">
            <Image 
              src={kifrango} 
              alt="Store Logo" 
              className="h-24 w-24"
            />
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 -mt-10 z-20 relative border-none">
          <Card className="bg-white py-4 lg:px-12 px-4 mb-8 border-none rounded-lg shadow-lg flex items-center justify-center">
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex flex-row items-center justify-center gap-4">
                <p className="text-sm lg:text-lg">www.versadelivery.com.br/kifrango</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="p-0 hover:bg-transparent">
                  <Copy className="h-6 w-6 text-gray-600" />
                </Button>
                <Button variant="ghost" size="icon" className="p-0 hover:bg-transparent">
                  <ExternalLink className="h-6 w-6 text-gray-600" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <AdminDashboardCard
                href="#pedidos"
                icon={ShoppingCart}
                title="Pedidos"
                description="Gerencie os pedidos da sua loja"
                iconBgColor="bg-blue-500"
              />
            </div>
            
            <div className="lg:col-span-1">
              <AdminDashboardCard
                href="#cardapio"
                icon={Utensils}
                title="Cardápio"
                description="Gerencie seu cardápio"
                iconBgColor="bg-yellow-500"
              />
            </div>
            
            <div className="lg:col-span-1">
              <AdminDashboardCard
                href="#configuracoes"
                icon={Settings}
                title="Configurações"
                description="Configure sua loja"
                iconBgColor="bg-gray-600"
              />
            </div>
            
            <div className="lg:col-start-2 lg:col-span-1">
              <AdminDashboardCard
                href="#marketing"
                icon={Target}
                title="Marketing"
                description="Estamos trabalhando nisso"
                iconBgColor="bg-purple-500"
              />
            </div>
            
            <div className="lg:col-span-1">
              <AdminDashboardCard
                href="#relatorios"
                icon={BarChart3}
                title="Relatórios"
                description="Acompanhe suas métricas"
                iconBgColor="bg-emerald-600"
              />
            </div>
          </div>
        </div>

        <footer className="bg-black text-white py-4 text-center text-sm">
          <p>VERSA DELIVERY 2025 - TODOS OS DIREITOS RESERVADOS</p>
        </footer>
      </main>
    </ProtectedRoute>
  );
}