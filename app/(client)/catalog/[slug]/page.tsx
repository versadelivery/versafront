"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Search, LogIn } from 'lucide-react'
import { Filters } from '@/app/(client)/catalog/[slug]/components/filters'
import { GroupSection } from '@/app/(client)/catalog/[slug]/components/group-section'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/app/(client)/client-auth/(auth)/components/auth-modal'
import { useCatalog } from '@/app/hooks/use-catalog'
import { Group, Item } from '@/app/types/client-catalog'

export default function CatalogPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const { data: groups = [], isLoading } = useCatalog(slug) as { data: Group[], isLoading: boolean }
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [sortOption, setSortOption] = useState('featured')
  const [cartItems, setCartItems] = useState<{id: string, quantity: number}[]>([])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const allItems = groups.flatMap((group: Group) => group.items)
  const totalCartItems = cartItems.reduce((sum: number, item: {id: string, quantity: number}) => sum + item.quantity, 0)

  const filteredGroups = groups
    .filter((group: Group) => 
      selectedGroups.length === 0 || selectedGroups.includes(group.id)
    )
    .map((group: Group) => ({
      ...group,
      items: group.items
        .filter((item: Item) => 
          item.attributes.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.attributes.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((item: Item) => 
          parseFloat(item.attributes.price) >= priceRange[0] && parseFloat(item.attributes.price) <= priceRange[1]
        )
        .sort((a: Item, b: Item) => {
          switch(sortOption) {
            case 'price-asc': return parseFloat(a.attributes.price) - parseFloat(b.attributes.price)
            case 'price-desc': return parseFloat(b.attributes.price) - parseFloat(a.attributes.price)
            case 'priority': return b.attributes.priority - a.attributes.priority
            default: return a.attributes.priority - b.attributes.priority
          }
        })
    }))
    .filter((group: Group) => group.items.length > 0)

  const addToCart = (productId: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === productId)
      if (existing) {
        return prev.map(item => 
          item.id === productId 
            ? {...item, quantity: item.quantity + 1} 
            : item
        )
      }
      return [...prev, {id: productId, quantity: 1}]
    })
  }

  const toggleFavorite = (productId: string) => {
    const updatedGroups = groups.map((group: Group) => ({
      ...group,
      items: group.items.map((item: Item) => 
        item.id === productId 
          ? {...item, isFavorite: !item.isFavorite} 
          : item
      )
    }))
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar produtos..."
              className="pl-8 pr-4 py-2 rounded-md border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Entrar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categorias em mobile */}
          <div className="lg:hidden mb-6">
            <ScrollArea className="w-full whitespace-nowrap">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-flow-col auto-cols-max gap-2 p-1">
                  <TabsTrigger 
                    value="all" 
                    onClick={() => setSelectedGroups([])}
                    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                      selectedGroups.length === 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </TabsTrigger>
                  {groups.map((group: Group) => (
                    <TabsTrigger 
                      key={group.id}
                      value={group.id}
                      onClick={() => setSelectedGroups([group.id])}
                      className={`px-4 py-2 rounded-full text-sm whitespace-nowrap max-w-[200px] truncate ${
                        selectedGroups.includes(group.id) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {group.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </ScrollArea>
          </div>
          
          {/* Filtros - Escondido em mobile, visível em desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <Filters
              selectedGroups={selectedGroups}
              onGroupsChange={setSelectedGroups}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              groups={groups}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedGroups.length === 0 ? 'Todos os produtos' : groups.find(g => g.id === selectedGroups[0])?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {allItems.length} {allItems.length === 1 ? 'produto' : 'produtos'} encontrados
                </p>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-gray-600 whitespace-nowrap">Ordenar por:</span>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Destaques</SelectItem>
                    <SelectItem value="price-asc">Preço: menor para maior</SelectItem>
                    <SelectItem value="price-desc">Preço: maior para menor</SelectItem>
                    <SelectItem value="rating">Melhores avaliações</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-12">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <Skeleton className="h-16 w-16 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="bg-gray-50 rounded-lg p-4">
                          <Skeleton className="h-48 w-full rounded-lg" />
                          <Skeleton className="h-4 w-3/4 mt-4" />
                          <Skeleton className="h-4 w-1/2 mt-2" />
                          <Skeleton className="h-6 w-1/3 mt-4" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredGroups.length > 0 ? (
              <div className="space-y-12">
                {filteredGroups.map((group: Group) => (
                  <GroupSection
                    key={group.id}
                    group={group}
                    onAddToCart={addToCart}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm">
                <Search className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  Não encontramos resultados para sua busca. Tente ajustar os filtros ou buscar por outro termo.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  )
} 