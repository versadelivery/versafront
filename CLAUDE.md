# Versa Front-end

## Stack

- **Next.js 15** (App Router) com **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** com **shadcn/ui** (New York style)
- **TanStack React Query** para server state
- **React Context** para global state (auth, cart, shop status)
- **Zod** para validação de schemas
- **react-hook-form** para formulários
- **Axios** para HTTP requests
- **ActionCable** para WebSockets

## Estrutura de Pastas

```
src/
├── api/              # Configuração Axios e requests organizados por domínio
│   ├── config.ts     # Instância Axios com interceptors
│   ├── routes.ts     # Constantes de endpoints
│   └── requests/     # Funções de request por domínio (catalog/, orders/, etc.)
├── app/              # Next.js App Router (file-based routing)
├── components/       # Componentes React organizados por feature
│   └── ui/           # Componentes shadcn/ui (não editar manualmente)
├── contexts/         # React Context providers
├── hooks/            # Custom hooks
├── lib/              # Utilitários core (auth, cable, utils)
├── schemas/          # Schemas Zod para validação
├── services/         # Business logic services
├── types/            # Definições de tipos TypeScript
└── utils/            # Funções utilitárias
```

## Convenções de Naming

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Arquivos de componente | kebab-case | `edit-item-modal.tsx` |
| Componentes (export) | PascalCase | `export function EditItemModal()` |
| Hooks | camelCase com `use` prefix | `useCart.ts`, `use-auth.ts` |
| Schemas | kebab-case com `-schema` suffix | `register-schema.ts` |
| Services | kebab-case com `-service` suffix | `auth-service.ts` |
| Types | kebab-case | `order.ts`, `catalog.ts` |
| Utils | kebab-case descritivo | `format-price.ts` |
| Pastas | kebab-case | `client-catalog/`, `super-admin/` |

## Padrões de Código

### Componentes

- Usar `'use client'` apenas quando necessário (interatividade)
- Componentes UI via shadcn/ui + Radix — não reinventar
- `cn()` de `@/lib/utils` para merge de classes Tailwind
- Props tipadas com `interface` quando complexas

### API Integration

```typescript
// src/api/requests/feature/requests.ts
import api from '@/api/config'
import { API_ENDPOINTS } from '@/api/routes'

export async function getItems() {
  const response = await api.get(API_ENDPOINTS.ITEMS)
  return response.data
}
```

### React Query

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['feature-name'],
  queryFn: getItems,
})

const mutation = useMutation({
  mutationFn: createItem,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['feature-name'] })
    toast.success('Item criado')
  },
  onError: () => {
    toast.error('Erro ao criar item')
  },
})
```

### Context

```typescript
// 1. Interface do contexto
interface FeatureContextType { ... }

// 2. Criar contexto
const FeatureContext = createContext<FeatureContextType | undefined>(undefined)

// 3. Provider
export function FeatureProvider({ children }) { ... }

// 4. Hook com validação
export function useFeature() {
  const context = useContext(FeatureContext)
  if (!context) throw new Error('useFeature must be used within FeatureProvider')
  return context
}
```

### Zod Schemas

```typescript
import { z } from 'zod'

export const featureSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
})

export type FeatureFormData = z.infer<typeof featureSchema>
```

### Imports — Ordem

1. React / Next.js
2. Bibliotecas externas (`@tanstack`, `@radix-ui`, `lucide-react`)
3. Imports locais com `@/` (components, hooks, api, lib, types)
4. Imports relativos (raro, evitar)

## Registro de Seções do Admin

- O arquivo `src/lib/admin-sections.ts` é a **fonte única de verdade** para todas as seções do painel admin
- **Ao criar uma nova página/seção no admin**, adicionar uma entrada no array `adminSections` com: `id`, `title`, `description`, `href`, `icon`, `iconBgColor`, `keywords` e `group`
- Se a nova seção deve aparecer no dashboard, adicionar o `id` ao array `dashboardSectionIds` em `src/app/admin/utils.ts`
- O command menu (busca global ⌘K) usa esse registro automaticamente

## Regras

- **Não editar** componentes em `src/components/ui/` diretamente — são gerados pelo shadcn/ui
- Usar `@/` para todos os imports do `src/`
- Toast notifications via `sonner` (`toast.success()`, `toast.error()`)
- Formatação de moeda: `Intl.NumberFormat` com `pt-BR` e `BRL`
- Checagem SSR: `typeof window !== 'undefined'` quando acessar browser APIs
