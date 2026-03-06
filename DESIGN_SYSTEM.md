# Design System — Versa Frontend

Guia de referência para manter consistência visual nas páginas públicas e de autenticação do Versa.

---

## Cores

| Token | Valor | Uso |
|---|---|---|
| **Warm off-white** | `#FAF9F7` | Background principal de todas as páginas |
| **Warm border** | `#E5E2DD` | Bordas de cards, inputs, separadores, dividers |
| **Placeholder bg** | `#F0EFEB` | Background de imagens placeholder, empty states |
| **Primary** | `--primary` (verde) | CTAs, botões principais, links ativos, ícones de seção |
| **White** | `#FFFFFF` | Background de cards, modais, header |

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

A exceção é `bg-[#FAF9F7]` (warm off-white do design system), que é usado como background de página e seções alternadas.

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

### 5. Container e largura

- Max-width padrão: `max-w-[1400px]`
- Padding horizontal: `px-4 sm:px-6 lg:px-8`
- Sidebar (desktop): `w-[380px]`

```tsx
<div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
  ...
</div>
```

### 6. Tamanho de fontes

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

## Checklist de revisão

Antes de entregar uma página pública, verificar:

- [ ] Background da página é `bg-[#FAF9F7]`
- [ ] Nenhum `bg-{cor}-50` presente (exceto `bg-[#FAF9F7]`)
- [ ] Nenhum `shadow-sm/md/lg` presente
- [ ] Todas as bordas usam `border-[#E5E2DD]` (exceto bordas contextuais)
- [ ] Todos os arredondamentos são `rounded-md` (exceto `rounded-full` permitidos)
- [ ] Container usa `max-w-[1400px]`
- [ ] Nenhum `text-xs` em conteúdo principal
- [ ] Header segue o padrão sticky com `h-16` e back button com `mr-auto`
- [ ] Nenhum `bg-gray-100` — usar `bg-[#F0EFEB]` para placeholders
- [ ] Nenhum `border-gray-100` ou `border-gray-200` — usar `border-[#E5E2DD]`
