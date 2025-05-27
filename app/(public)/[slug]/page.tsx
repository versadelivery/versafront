"use client"

import { notFound, useParams } from 'next/navigation'
import { useShopBySlug } from './use-slug'
import { useState } from 'react'
import ItemCard from './item-card'
import { Loader2, Phone, Search, StoreIcon } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import type { CatalogItem } from './types'
import { normalizeItems } from './normalize-items'
import logoHeader from "@/public/img/logo.svg";
import Image from 'next/image'

function StoreCatalog() {
  const params = useParams()
  const slug = params.slug as string
  const { data: shop, isLoading } = useShopBySlug(slug)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const groups = shop?.data.attributes.catalog_groups.data || []
  
  const allItems = groups.flatMap(group => 
    normalizeItems(group.attributes.items)
  ).filter(item => 
    item.attributes.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.attributes.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const itemsByGroup = groups.reduce((acc, group) => {
    acc[group.attributes.name] = normalizeItems(group.attributes.items)
      .filter(item => 
        item.attributes.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.attributes.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return acc
  }, {} as Record<string, CatalogItem[]>)

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Loader2 className="animate-spin h-12 w-12 text-primary" />
    </div>
  )
  
  if (!shop) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full bg-black backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
          <div className="flex items-center">
            <Image src={logoHeader} alt="Logo" width={120} className="h-auto" />
          </div>
        </div>
      </header>

      <div className="bg-primary py-8 text-white">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <StoreIcon className="w-12 h-12 text-white" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              {shop.data.attributes.name}
            </h1>
            <p className="text-white/90">{shop.data.attributes.cellphone}</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="md:hidden w-full">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os itens</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.attributes.name}>
                    {group.attributes.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full hidden md:block"
        >
          <TabsList className="w-full flex gap-1 p-1 bg-gray-100 rounded-lg">
            <TabsTrigger 
              value="all" 
              className="flex-1 py-2 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
            >
              Todos
            </TabsTrigger>
            {groups.map(group => (
              <TabsTrigger 
                key={group.id} 
                value={group.attributes.name}
                className="flex-1 py-2 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
              >
                {group.attributes.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="mt-8">
          {activeTab === 'all' && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {allItems.map((item, index) => (
                <ItemCard key={index} item={item} />
              ))}
              {allItems.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
                  <p className="mt-1 text-gray-500">Tente ajustar sua busca ou filtro</p>
                </div>
              )}
            </div>
          )}

          {groups.map(group => (
            activeTab === group.attributes.name && (
              <div key={group.id} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {itemsByGroup[group.attributes.name]?.map((item, index) => (
                  <ItemCard key={index} item={item} />
                ))}
                {itemsByGroup[group.attributes.name]?.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Search className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
                    <p className="mt-1 text-gray-500">Tente ajustar sua busca ou filtro</p>
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      </main>
    </div>
  )
}

export default StoreCatalog