import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Search className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">!</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Loja não encontrada</h1>
          <p className="text-gray-500 max-w-md">
            Desculpe, não conseguimos encontrar a loja que você está procurando. 
            Verifique se o endereço está correto ou tente novamente mais tarde.
          </p>
        </div>

        {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Voltar para a página inicial
          </Link>
          <Link 
            href="/catalog"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Ver todas as lojas
          </Link>
        </div> */}
      </div>
    </div>
  )
} 