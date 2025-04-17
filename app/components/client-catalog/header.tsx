import { Search, ShoppingCart, Truck } from 'lucide-react'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'

interface HeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  totalCartItems: number
}

export function Header({ searchTerm, onSearchChange, totalCartItems }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Truck className="text-primary h-8 w-8" />
          <h1 className="text-2xl font-bold text-primary">FrigoDelivery</h1>
        </div>
        
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar carnes, frangos, linguiças..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <Button variant="outline" className="relative">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Carrinho
          {totalCartItems > 0 && (
            <Badge className="absolute -right-2 -top-2 h-5 w-5 justify-center rounded-full p-0">
              {totalCartItems}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  )
} 