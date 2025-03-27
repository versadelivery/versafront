"use client";

import { useState } from "react";
import { Utensils, Package, Search, Filter, Plus, Edit2, ArrowLeft } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import peitoDeFrango from "@/public/img/peito-de-frango.jpg";
import picanha from "@/public/img/picanha.jpg";
import Link from "next/link";

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'stock'>('catalog');

  return (
    <div className="w-full px-4 sm:px-8 lg:px-24">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin" className="text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">
          {activeTab === 'catalog' ? 'CATÁLOGO' : 'ESTOQUE'}
        </h1>
      </div>
      <p className="text-gray-500 mb-6 sm:mb-8">
        {activeTab === 'catalog' 
          ? 'Gerencie seu catálogo, estoque e disponibilidade dos itens' 
          : 'Controle de matéria prima e insumos'}
      </p>

      <div className="w-full lg:max-w-[66.666%]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div 
            className={`p-4 sm:p-6 cursor-pointer rounded-lg ${activeTab === 'catalog' ? 'bg-primary text-white' : 'bg-[#212121]/10'}`}
            onClick={() => setActiveTab('catalog')}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`p-2 rounded-md ${activeTab === 'catalog' ? 'bg-white' : 'bg-white'}`}>
                <Utensils className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'catalog' ? 'text-primary' : 'text-gray-400'}`} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">CATÁLOGO</h2>
                <p className={`text-xs sm:text-sm ${activeTab === 'catalog' ? 'opacity-90' : 'text-gray-600'}`}>
                  Crie grupos, itens e complementos
                </p>
              </div>
            </div>
          </div>

          <div 
            className={`p-4 sm:p-6 cursor-pointer rounded-lg ${activeTab === 'stock' ? 'bg-primary text-white' : 'bg-[#212121]/10'}`}
            onClick={() => setActiveTab('stock')}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`p-2 rounded-md ${activeTab === 'stock' ? 'bg-white' : 'bg-white'}`}>
                <Package className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'stock' ? 'text-primary' : 'text-gray-400'}`} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">ESTOQUE</h2>
                <p className={`text-xs sm:text-sm ${activeTab === 'stock' ? 'opacity-90' : 'text-gray-600'}`}>
                  Controle de matéria prima e insumos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <CatalogContent />
      ) : (
        <StockContent />
      )}
    </div>
  );
}

function CatalogContent() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white">
        <div className="w-full">
          <div className="flex flex-col gap-3 mb-6 lg:gap-4 lg:mb-8 lg:flex-row">
            <div className="relative w-full lg:flex-1">
              <div className="relative flex items-center bg-[#212121]/10 rounded-sm h-full">
                <Search className="absolute left-3 w-4 h-4 lg:w-5 lg:h-5 text-[#212121]/70" />
                <Input 
                  placeholder="Buscar itens..." 
                  className="py-6 pl-10 pr-4 bg-transparent border-none shadow-none placeholder:text-[#212121]/70 focus-visible:ring-0 w-full text-sm lg:text-base lg:py-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full lg:flex lg:gap-4 lg:w-auto">
              <Button 
                variant="ghost" 
                className="py-6 flex items-center justify-center gap-2 bg-[#212121]/10 hover:bg-[#212121]/20 border-none shadow-none text-[#212121]/70 text-sm lg:py-8 lg:flex-1"
              >
                <Filter className="w-4 h-4" />
                <span className="whitespace-nowrap">Todas categorias</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="py-6 flex items-center justify-center gap-2 bg-[#212121]/10 hover:bg-[#212121]/20 border-none shadow-none text-[#212121]/70 text-sm lg:py-8 lg:flex-1"
              >
                <Plus className="w-4 h-4" />
                <span>Novo grupo</span>
              </Button>

              <Button 
                className="col-span-2 py-6 bg-primary hover:bg-emerald-700 text-white flex items-center justify-center gap-2 text-sm lg:col-auto lg:py-8 lg:flex-1"
              >
                <Plus className="w-4 h-4" />
                <span>Novo item</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 lg:grid-cols-3">
            <div className="overflow-hidden bg-[#212121]/10 rounded-lg shadow-none">
              <div className="relative w-full aspect-square lg:h-48">
                <Image
                  src={picanha}
                  alt="Picanha"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <Button 
                  size="icon"
                  variant="ghost" 
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white w-8 h-8 lg:w-10 lg:h-10"
                >
                  <Edit2 className="w-3 h-3 lg:w-4 lg:h-4" />
                </Button>
              </div>
              <div className="p-3 lg:p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-semibold lg:text-base">PICANHA</h3>
                    <p className="text-xs text-gray-500 lg:text-sm">Por unidade</p>
                  </div>
                  <span className="text-sm font-semibold lg:text-base">R$ 31,70</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 lg:text-sm">Carnes</span>
                  <span className="text-xs text-primary lg:text-sm">Ativo</span>
                </div>
              </div>
            </div>

            <div className="overflow-hidden bg-[#212121]/10 rounded-lg shadow-none">
              <div className="relative w-full aspect-square lg:h-48">
                <Image
                  src={peitoDeFrango}
                  alt="Peito de Frango"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <Button 
                  size="icon"
                  variant="ghost" 
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white w-8 h-8 lg:w-10 lg:h-10"
                >
                  <Edit2 className="w-3 h-3 lg:w-4 lg:h-4" />
                </Button>
              </div>
              <div className="p-3 lg:p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-semibold lg:text-base">PEITO DE FRANGO</h3>
                    <p className="text-xs text-gray-500 lg:text-sm">Por peso</p>
                  </div>
                  <span className="text-sm font-semibold lg:text-base">R$ 28,30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 lg:text-sm">Carnes</span>
                  <span className="text-xs text-primary lg:text-sm">Ativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

function StockContent() {
  return (
    <div>
      storage
    </div>
  );
}