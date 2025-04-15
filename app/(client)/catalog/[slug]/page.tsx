"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Search, LogIn, LogOut, ShoppingCart, CheckCircle } from 'lucide-react'
import { Filters } from '@/app/(client)/catalog/[slug]/components/filters'
import { GroupSection } from '@/app/(client)/catalog/[slug]/components/group-section'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/app/(client)/client-auth/(auth)/components/auth-modal'
import CartDrawer from './components/cart-drawer'
import { useCatalog } from '@/app/hooks/use-catalog'
import logoHeader from "@/public/img/logo.svg";
import { Group, Item } from '@/app/types/client-catalog'
import Image from 'next/image'
import { useCart } from '../store/CartContext'
import { useAuth } from '@/app/(client)/client-auth/hooks/useAuth'

export default function CatalogPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const { data: groups = [], isLoading } = useCatalog(slug) as { data: Group[], isLoading: boolean }
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [sortOption, setSortOption] = useState('featured')
  const [cartItems, setCartItems] = useState<{id: string, quantity: number, product: Item}[]>([])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [allItems, setAllItems] = useState<Item[]>([])
  const { items: persistedItems, addItem, updateQuantity, removeItem, getItemsByStore } = useCart()
  const { isAuthenticated, logout } = useAuth()

  useEffect(() => {
    console.log('Itens do carrinho no localStorage:', persistedItems);
  }, [persistedItems]);

  const totalCartItems = cartItems.reduce((sum: number, item: {id: string, quantity: number}) => sum + item.quantity, 0)

  useEffect(() => {
    if (allItems.length > 0) {
      const storeItems = getItemsByStore(slug)
      
      const mappedItems = storeItems.map(item => {
        const product = allItems.find(p => p.id === item.id)
        if (product) {
          return {
            id: item.id,
            quantity: item.quantity,
            product
          }
        }
        return null
      }).filter(Boolean) as {id: string, quantity: number, product: Item}[]
      
      setCartItems(mappedItems)
    }
  }, [allItems, slug, getItemsByStore])

  useEffect(() => {
    if (groups.length > 0) {
      const items = groups.flatMap((group: Group) => group.items)
      setAllItems(items)
    }
  }, [groups])

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

const addToCart = (productId: string, options?: any) => {
  if (!isAuthenticated) {
    setIsAuthModalOpen(true)
    return
  }

  const product = allItems.find(item => item.id === productId)
  if (!product) return

  // Calcular preço base - usar preço com desconto se disponível
  let price = product.attributes.price_with_discount 
    ? parseFloat(product.attributes.price_with_discount)
    : parseFloat(product.attributes.price)

  if (options?.weight && product.attributes.item_type === 'weight') {
    price = price * options.weight
  }

  // Adicionar preço dos extras
  if (options?.extras) {
    options.extras.forEach((extra: { price: number }) => {
      price += extra.price
    })
  }

  const cartItem = {
    id: product.id,
    name: product.attributes.name,
    price: price,
    quantity: 1,
    image: product.attributes.image_url || '',
    storeSlug: slug,
    options: options || null
  }
  
  addItem(cartItem)
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

  const updateCartItem = (productId: string, newQuantity: number) => {
    setCartItems(prev => {
      if (newQuantity <= 0) {
        return prev.filter(item => item.id !== productId)
      }
      return prev.map(item => 
        item.id === productId 
          ? {...item, quantity: newQuantity} 
          : item
      )
    })

    if (newQuantity <= 0) {
      removeItem(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }
    
    if (isAuthenticated) {
      router.push(`/catalog/${slug}/checkout`);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-50 w-full shadow-lg bg-black backdrop-blur p-2">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center md:min-w-[120px] md:justify-end">
            <div className="hidden md:block">
              <Image src={logoHeader} alt="Versa" width={120} />
            </div>
          </div>

          <div className="flex flex-1 justify-center px-2">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                className="w-full rounded-xs bg-background pl-10 pr-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:min-w-[120px] md:justify-start">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="relative"
                >
                  <LogOut className="h-5 w-5 text-white" />
                  <span className="sr-only">Sair</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5 text-white" />
                  {totalCartItems > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {totalCartItems}
                    </span>
                  )}
                  <span className="sr-only">Carrinho</span>
                </Button>
                
                {totalCartItems > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleCheckout}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalizar Pedido
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsAuthModalOpen(true)}
                className="cursor-pointer rounded-xs font-antarctican-mono bg-transparent border-white text-white hover:bg-white hover:text-black gap-2"
              >
                <LogIn className="h-5 w-5" />
                  Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:hidden mb-6">
          <ScrollArea className="w-full whitespace-nowrap rounded-lg">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="flex w-full space-x-2 p-1 bg-gray-50">
                <TabsTrigger 
                  value="all" 
                  onClick={() => setSelectedGroups([])}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedGroups.length === 0 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Todos
                </TabsTrigger>
                {groups.map((group: Group) => (
                  <TabsTrigger 
                    key={group.id}
                    value={group.id}
                    onClick={() => setSelectedGroups([group.id])}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedGroups.includes(group.id) 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {group.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </ScrollArea>
          </div>
          
          {!isLoading && (
            <div className="hidden lg:block w-72 flex-shrink-0">
              <Filters
                selectedGroups={selectedGroups}
                onGroupsChange={setSelectedGroups}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                groups={groups}
              />
            </div>
          )}
          
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

      <CartDrawer
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cartItems={cartItems}
        allItems={allItems}
        updateCartItem={updateCartItem}
      />
    </div>
  )
} 