# Design System — Versa Frontend

Guia de referencia para manter consistencia visual em todo o Versa (paginas publicas, autenticacao e admin).

---

## Cores

| Token | Valor | Uso |
|---|---|---|
| **Warm off-white** | `#FAF9F7` | Background principal de todas as paginas |
| **Warm border** | `#E5E2DD` | Bordas de cards, inputs, separadores, dividers |
| **Placeholder bg** | `#F0EFEB` | Background de imagens placeholder, empty states |
| **Primary** | `--primary` (verde) | CTAs, botoes principais, links ativos, icones de secao |
| **White** | `#FFFFFF` | Background de cards, modais, header |
| **Recebidos bg** | `#FFFBF5` | Background de cards de pedidos recebidos (tom quente) |
| **Entregue bg** | `#F0FFF4` | Background de cards de pedidos entregues (tom verde) |

## Regras fundamentais

### 1. Sem backgrounds com opacidade fraca

**Proibido** usar classes como `bg-amber-50`, `bg-red-50`, `bg-blue-50`, `bg-green-50`, `bg-orange-50`, `bg-purple-50`, `bg-emerald-50`, `bg-gray-50` ou qualquer `bg-{cor}-{50}`.

**Correto**: usar `bg-white` com bordas mais fortes da cor correspondente.

```tsx
// ERRADO
<div className="bg-amber-50 border border-amber-200">...</div>
<div className="bg-red-50 border border-red-200">...</div>

// CORRETO
<div className="bg-white border border-amber-400">...</div>
<div className="bg-white border border-red-400">...</div>
```

A excecao e `bg-[#FAF9F7]` (warm off-white do design system), que e usado como background de pagina e secoes alternadas.

Excecoes adicionais para cards de status no admin:
- `bg-[#FFFBF5]` — pedidos recebidos (tom quente sutil)
- `bg-[#F0FFF4]` — pedidos entregues (tom verde sutil)
- `bg-primary` — pedidos prontos (destaque total)
- `opacity-50` — pedidos cancelados (card apagado)

### 2. Arredondamento padronizado

Usar `rounded-md` (6px) em **todos** os elementos: cards, inputs, botões, badges, modais, imagens, painéis.

**Exceções permitidas**:
- `rounded-full` — apenas para: botão de fechar circular, badge de desconto circular, seletor de quantidade circular, avatar
- `rounded-md` no badge de status (não `rounded-full`)

```tsx
// ERRADO
<div className="rounded-xl">...</div>
<div className="rounded-lg">...</div>
<div className="rounded-2xl">...</div>

// CORRETO
<div className="rounded-md">...</div>
```

### 3. Sem sombras

Não usar `shadow-sm`, `shadow-md`, `shadow-lg` ou qualquer variante de sombra.

Usar bordas para definir hierarquia visual:

```tsx
// ERRADO
<div className="shadow-sm rounded-lg">...</div>

// CORRETO
<div className="border border-[#E5E2DD] rounded-md">...</div>
```

### 4. Bordas com destaque

Todas as bordas devem usar `border-[#E5E2DD]` (warm gray). Não usar `border-gray-100`, `border-gray-200` ou similares.

Para bordas contextuais (erro, sucesso, alerta), usar tons fortes:

| Contexto | Borda |
|---|---|
| Padrão | `border-[#E5E2DD]` |
| Erro | `border-red-400` |
| Sucesso | `border-green-400` |
| Alerta | `border-amber-400` |
| Selecionado/ativo | `border-primary` |

### 5. Sem emojis na UI

Nunca usar emojis nos componentes/cards. Sempre substituir por icones Lucide.

```tsx
// ERRADO
<span>💳 Pix</span>
<span>📞 (11) 99999-0000</span>

// CORRETO
<CreditCard className="w-3.5 h-3.5 text-gray-500" />
<span>Pix</span>

<Phone className="w-3.5 h-3.5 text-gray-500" />
<span>(11) 99999-0000</span>
```

Emojis sao permitidos apenas em textos copiados para WhatsApp/Telegram (funcoes de copia).

### 6. Botoes — bordas e cursor

Todos os botoes de acao devem ter `border border-gray-300 cursor-pointer`. Nao usar bordas pretas opacas nem deixar botoes sem borda visivel.

```tsx
// Botao padrao
<Button className="rounded-md border border-gray-300 cursor-pointer">
  Acao
</Button>

// Botao destrutivo tambem recebe borda
<Button variant="destructive" className="rounded-md border border-gray-300 cursor-pointer">
  Cancelar
</Button>
```

### 7. Container e largura

- Max-width padrao: `max-w-[1400px]`
- Max-width admin (telas largas como pedidos): `max-w-[1920px]`
- Padding horizontal: `px-4 sm:px-6 lg:px-8`
- Sidebar (desktop): `w-[380px]`

```tsx
<div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
  ...
</div>
```

### 8. Tamanho de fontes

Textos devem ser legíveis. Evitar `text-xs` no conteúdo principal.

| Elemento | Tamanho |
|---|---|
| Título da página | `text-2xl font-bold` |
| Heading de seção/card | `text-base font-semibold` |
| Nome de item | `text-base font-semibold` |
| Corpo/valores | `text-base` |
| Labels de formulário | `text-sm font-medium` |
| Metadata (data, contagem) | `text-sm` |
| Total destaque | `text-lg font-bold` |
| Botão principal | `text-base font-semibold` |

`text-xs` é aceitável apenas para: badges de desconto percentual, contadores inline muito compactos.

## Componentes

### Header (páginas públicas)

```tsx
<header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5E2DD]">
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center h-16">
      <Link className="... mr-auto">  {/* back button empurrado pra esquerda */}
        <ChevronLeft className="h-5 w-5" />
        <span className="text-sm font-medium hidden sm:block">Voltar</span>
      </Link>
      {/* Logo alinhada à direita */}
    </div>
  </div>
</header>
```

### Card de seção

```tsx
<div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
  <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
    <Icon className="h-4 w-4 text-primary" />
    <h2 className="text-base font-semibold text-gray-900">Título</h2>
  </div>
  <div className="px-5 py-4">
    {/* conteúdo */}
  </div>
</div>
```

### Status badge

```tsx
// bg-white + borda forte da cor, sem background com opacidade
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-white text-sm font-semibold border-amber-300 text-amber-700">
  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
  Recebido
</span>
```

### Toggle (delivery/pickup)

```tsx
<div className="flex bg-gray-100 rounded-md p-1 gap-1">
  <button className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
    active ? 'bg-white text-gray-900 border border-[#E5E2DD]' : 'text-muted-foreground'
  }`}>
    ...
  </button>
</div>
```

### Botão de quantidade (+/-)

```tsx
<div className="flex items-center border border-[#E5E2DD] rounded-md">
  <button className="w-8 h-8 flex items-center justify-center ...">−</button>
  <span className="w-8 text-center font-semibold text-sm">{qty}</span>
  <button className="w-8 h-8 flex items-center justify-center ...">+</button>
</div>
```

Sempre visível em todos os itens (inclusive itens por peso).

### Botão CTA principal

```tsx
<button className="w-full py-3.5 rounded-md text-base font-semibold bg-primary text-white hover:bg-primary/90">
  Finalizar pedido
</button>
```

### Imagem placeholder

```tsx
// Com imagem
<img className="rounded-md object-cover bg-[#F0EFEB]" />

// Sem imagem
<div className="rounded-md bg-[#F0EFEB] flex items-center justify-center">
  <Icon className="text-gray-300" />
</div>
```

### Loading (paginas publicas)

Logo pulsante centralizada em tela cheia. Usar o componente `PublicLoading`.

```tsx
import PublicLoading from "@/components/public-loading";

// Dentro de Suspense ou loading.tsx
<PublicLoading />
```

Renderiza a logo (favicon.svg) com `width={140} height={140}` e `animate-pulse` sobre `bg-[#FAF9F7]`.

### Header admin (paginas internas)

```tsx
<div className="bg-white border-b border-[#E5E2DD]">
  <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center gap-4">
        <a href="/admin" className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:block">Voltar</span>
        </a>
        <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
        <h1 className="text-base sm:text-lg font-bold text-gray-900">Titulo</h1>
      </div>
      {/* Acoes a direita */}
    </div>
  </div>
</div>
```

### SectionCard (modais e paineis)

Card com header icone + titulo e conteudo separado por borda.

```tsx
<div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
  <div className="px-4 py-3 border-b border-[#E5E2DD] flex items-center gap-2">
    <Icon className="h-4 w-4 text-primary" />
    <h3 className="text-sm font-semibold text-gray-900">Titulo</h3>
  </div>
  <div className="px-4 py-3">
    {/* conteudo com divide-y divide-[#E5E2DD] */}
  </div>
</div>
```

### InfoRow (linhas de informacao)

Label a esquerda, valor a direita. Usar dentro de SectionCard com dividers.

```tsx
<div className="flex items-start justify-between py-1.5">
  <span className="text-sm text-muted-foreground">Label</span>
  <span className="text-sm font-medium text-gray-900 text-right">Valor</span>
</div>
```

### Select/Dropdown

```tsx
<select className="border border-[#E5E2DD] rounded-md px-3 py-2 text-sm bg-white max-w-[200px] truncate cursor-pointer">
  <option value="">Selecione</option>
</select>
```

### Truncate para textos longos

Nomes de clientes, enderecos e nomes de itens devem usar `truncate` para evitar scroll horizontal. Containers pai precisam de `min-w-0` ou `overflow-hidden`.

```tsx
<div className="min-w-0">
  <h3 className="font-bold text-sm truncate">Nome muito longo do cliente...</h3>
</div>
```

### Modal padrao (Dialog)

Estrutura: header fixo + body scrollavel com `bg-[#FAF9F7]`.

```tsx
<DialogContent className="max-w-7xl p-0 flex flex-col max-h-[90vh]">
  {/* Header fixo */}
  <div className="px-6 py-4 border-b border-[#E5E2DD] flex items-center justify-between flex-shrink-0">
    ...
  </div>
  {/* Body scrollavel */}
  <div className="flex-1 overflow-y-auto bg-[#FAF9F7] p-6">
    ...
  </div>
</DialogContent>
```

## Checklist de revisao

Antes de entregar qualquer pagina, verificar:

**Cores e backgrounds**
- [ ] Background da pagina e `bg-[#FAF9F7]`
- [ ] Nenhum `bg-{cor}-50` presente (exceto `bg-[#FAF9F7]` e cores de status de cards)
- [ ] Nenhum `bg-gray-100` — usar `bg-[#F0EFEB]` para placeholders
- [ ] Nenhum `bg-gray-50` — usar `bg-[#FAF9F7]`

**Bordas e sombras**
- [ ] Nenhum `shadow-sm/md/lg` presente
- [ ] Todas as bordas usam `border-[#E5E2DD]` (exceto bordas contextuais)
- [ ] Nenhum `border-gray-100` ou `border-gray-200` — usar `border-[#E5E2DD]`

**Arredondamento**
- [ ] Todos os arredondamentos sao `rounded-md` (exceto `rounded-full` permitidos)

**Tipografia**
- [ ] Nenhum `text-xs` em conteudo principal
- [ ] Textos longos tem `truncate` para evitar overflow

**Layout**
- [ ] Container usa `max-w-[1400px]` (publico) ou `max-w-[1920px]` (admin)
- [ ] Header segue o padrao sticky com `h-16` e back button

**Interacao**
- [ ] Todos os botoes tem `border border-gray-300 cursor-pointer`
- [ ] Selects tem `cursor-pointer` e borda `border-[#E5E2DD]`
- [ ] Nenhum emoji na UI — usar icones Lucide

**Modais**
- [ ] Header fixo com `border-b border-[#E5E2DD]`
- [ ] Body scrollavel com `bg-[#FAF9F7]`
- [ ] Secoes usam SectionCard com icone + titulo
