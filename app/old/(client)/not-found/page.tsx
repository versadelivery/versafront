import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Search className="w-12 h-12 text-primary" />
          <div className="absolute -top-2 right-42 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Loja não encontrada</h1>
          <p className="text-gray-500 max-w-md">
            Desculpe, não conseguimos encontrar a loja que você está procurando. 
            Verifique se o endereço está correto ou tente novamente mais tarde.
          </p>
        </div>

      </div>
    </div>
  )
} 