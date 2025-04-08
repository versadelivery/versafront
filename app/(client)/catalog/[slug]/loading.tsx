import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Skeleton do filtro */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-2 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton do conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-10 w-[180px]" />
            </div>

            <div className="space-y-12">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="space-y-4">
                        <Skeleton className="h-48 w-full rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 