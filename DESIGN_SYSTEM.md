# Design System — Versa Frontend

Guia de referencia para manter consistencia visual em todo o Versa (paginas publicas, autenticacao e admin).
Inspirado no design system do Brevo (brevo.com) — moderno, limpo, com personalidade.

---

## Fontes

| Tipo | Fonte | Fallback | Uso |
|---|---|---|---|
| **Display / Titulos** | `Tomato Grotesk` | `PP Neue Montreal`, `system-ui`, `sans-serif` | Titulos de pagina, hero, headings de secao, logo |
| **Body / Interface** | `Inter` | `system-ui`, `sans-serif` | Corpo de texto, labels, botoes, inputs, metadata |

### Configuracao (Tailwind / CSS)

```css
/* Importar as fontes no layout global */
@font-face {
  font-family: 'Tomato Grotesk';
  src: url('/fonts/tomato-grotesk-medium.woff2') format('woff2');
  font-weight: 500;
  font-display: swap;
}
@font-face {
  font-family: 'Tomato Grotesk';
  src: url('/fonts/tomato-grotesk-semibold.woff2') format('woff2');
  font-weight: 600;
  font-display: swap;
}
@font-face {
  font-family: 'Tomato Grotesk';
  src: url('/fonts/tomato-grotesk-bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}

/* Inter via Google Fonts ou local */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

```ts
// tailwind.config — fontFamily
fontFamily: {
  display: ['Tomato Grotesk', 'PP Neue Montreal', 'system-ui', 'sans-serif'],
  body: ['Inter', 'system-ui', 'sans-serif'],
}
```

Usar `font-display` para titulos/headings e `font-body` para todo o resto.

---

## Cores

| Token | Valor | Uso |
|---|---|---|
| **Cream** | `#FFFDF6` | Background principal de todas as paginas |
| **White** | `#FFFFFF` | Background de cards, modais, header |
| **Mint 100** | `#F9FFF6` | Background de secoes alternadas, hover sutil |
| **Mint 300** | `#C0FFA5` | Badges de destaque, tags de sucesso, accent suave |
| **Forest Green 600** | `#0B996E` | CTA principal, botoes primarios, links ativos, icones de secao |
| **Forest Green 800** | `#006A43` | Hover de botoes primarios, bordas ativas, focus ring |
| **Forest Green 900** | `#004228` | Texto sobre fundo verde, estados pressed |
| **Charcoal 900** | `#1B1B1B` | Texto principal, titulos |
| **Charcoal 700** | `#474747` | Texto secundario, subtitulos |
| **Charcoal 500** | `#858585` | Texto terciario, placeholders, metadata |
| **Border** | `#E8E4DF` | Bordas de cards, inputs, separadores, dividers |
| **Iris Purple** | `#6358DE` | Accent secundario, badges especiais, destaques |
| **Peony Pink** | `#B22557` | Erros, estados destrutivos, alertas criticos |
| **Sky Blue** | `#2676C0` | Links informativos, badges de info |
| **Recebidos bg** | `#FFFBF5` | Background de cards de pedidos recebidos (tom quente) |
| **Entregue bg** | `#F0FFF4` | Background de cards de pedidos entregues (tom verde) |

### Paleta de status (pedidos admin)

| Status | Background | Borda | Texto |
|---|---|---|---|
| Recebido | `#FFFBF5` | `border-amber-300` | `text-amber-700` |
| Em preparo | `bg-white` | `border-primary` | `text-primary` |
| Pronto | `bg-primary` | — | `text-white` |
| Entregue | `#F0FFF4` | `border-green-400` | `text-green-700` |
| Cancelado | `opacity-50` | `border-[#E8E4DF]` | `text-charcoal-500` |

---

## Regras fundamentais

### 1. Backgrounds — cream, nao cinza

**Proibido** usar `bg-gray-50`, `bg-gray-100`, ou qualquer `bg-{cor}-{50}`.

**Correto**: usar `bg-[#FFFDF6]` (cream) como background de pagina e secoes, `bg-white` para cards.

```tsx
// ERRADO
<div className="bg-gray-50">...</div>
<div className="bg-gray-100">...</div>

// CORRETO
<div className="bg-[#FFFDF6]">...</div>  // pagina
<div className="bg-white">...</div>       // card
```

Excecao: `bg-[#F9FFF6]` (mint 100) para secoes alternadas.

### 2. Arredondamento — generoso e consistente

O Brevo usa arredondamentos generosos. Seguir esta hierarquia:

| Elemento | Classe | Valor |
|---|---|---|
| **Botoes** | `rounded-2xl` | 1rem (16px) — igual cards |
| **Cards, modais, paineis** | `rounded-2xl` | 1rem (16px) |
| **Inputs, selects, textareas** | `rounded-xl` | 0.75rem (12px) |
| **Badges, tags** | `rounded-full` | pill (excecao: badges pequenos) |
| **Imagens, thumbnails** | `rounded-2xl` | 1rem (16px) |
| **Elementos internos (inner cards)** | `rounded-xl` | 0.75rem (12px) |

```tsx
// ERRADO
<div className="rounded-md">...</div>
<button className="rounded-md">...</button>
<div className="rounded-lg">...</div>

// CORRETO
<div className="rounded-2xl">...</div>        // card
<button className="rounded-full">...</button>  // botao
<input className="rounded-xl" />               // input
```

### 3. Sombras — suaves e intencionais

Diferente do design anterior, **usar sombras** para hierarquia visual. Sombras suaves com tom quente.

| Contexto | Valor |
|---|---|
| **Card padrao** | `shadow-sm` → `0 1px 2px 0 rgba(27,27,27,.08)` |
| **Card elevado / hover** | `shadow-md` → `0 2px 4px -2px rgba(27,27,27,.1), 0 4px 8px -2px rgba(27,27,27,.14)` |
| **Modal / dropdown** | `shadow-lg` → `0 4px 15px hsla(0,0%,51%,.2)` |
| **Header fixo** | `shadow-md` → `0 5px 20px 0 rgba(0,0,0,.1)` |
| **Focus ring** | `ring-2 ring-[#006A43]/20` |

```tsx
// Card com sombra
<div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
  ...
</div>

// Modal
<div className="bg-white rounded-2xl shadow-lg">
  ...
</div>
```

### 4. Bordas — usadas com parcimonia

Bordas sao **opcionais** (sombras sao preferidas para hierarquia). Quando usadas:

| Contexto | Borda |
|---|---|
| Padrao (inputs, dividers) | `border-[#E8E4DF]` |
| Separadores internos | `divide-[#E8E4DF]` |
| Erro | `border-[#B22557]` |
| Sucesso | `border-[#0B996E]` |
| Alerta | `border-amber-400` |
| Selecionado/ativo | `border-[#006A43]` |
| Focus | `ring-2 ring-[#006A43]/20 border-[#006A43]` |

**Nao** usar `border-gray-100`, `border-gray-200`, `border-gray-300`. Usar `border-[#E8E4DF]` ou nenhuma borda (apenas sombra).

### 5. Sem emojis na UI

Nunca usar emojis nos componentes/cards. Sempre substituir por icones Lucide.

```tsx
// ERRADO
<span>💳 Pix</span>

// CORRETO
<CreditCard className="w-4 h-4 text-[#858585]" />
<span>Pix</span>
```

Emojis sao permitidos apenas em textos copiados para WhatsApp/Telegram (funcoes de copia).

### 6. Botoes — pill shape com hierarquia clara

Todos os botoes usam `rounded-full` (pill shape). Tres variantes principais:

#### Primary (CTA)

```tsx
<button className="rounded-full bg-[#0B996E] text-white px-6 py-3 font-body font-semibold text-base
  hover:bg-[#006A43] active:bg-[#004228] transition-colors cursor-pointer">
  Finalizar pedido
</button>
```

#### Secondary (outline)

```tsx
<button className="rounded-full border border-[#E8E4DF] bg-white text-[#1B1B1B] px-6 py-3
  font-body font-semibold text-base hover:bg-[#F9FFF6] transition-colors cursor-pointer">
  Voltar
</button>
```

#### Ghost (sem borda)

```tsx
<button className="rounded-full text-[#474747] px-4 py-2 font-body font-medium text-sm
  hover:bg-[#FFFDF6] transition-colors cursor-pointer">
  Cancelar
</button>
```

#### Destructive

```tsx
<button className="rounded-full bg-[#B22557] text-white px-6 py-3 font-body font-semibold text-base
  hover:bg-[#B22557]/90 transition-colors cursor-pointer">
  Excluir
</button>
```

#### Tamanhos de botao

| Tamanho | Altura | Padding | Font |
|---|---|---|---|
| **sm** | `h-10` (40px) | `px-4 py-2` | `text-sm font-medium` |
| **md** | `h-12` (48px) | `px-6 py-3` | `text-base font-semibold` |
| **lg** | `h-[68px]` | `px-8 py-4` | `text-lg font-semibold` |

Todos os botoes devem ter `cursor-pointer` e `transition-colors`.

### 7. Container e largura

| Contexto | Max-width |
|---|---|
| Paginas publicas | `max-w-[1200px]` |
| Admin (telas largas) | `max-w-[1440px]` |
| Padding horizontal | `px-4 sm:px-6 lg:px-8` |
| Sidebar (desktop) | `w-[380px]` |

```tsx
<div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
  ...
</div>
```

### 8. Tipografia — hierarquia clara

Titulos usam `font-display` (Tomato Grotesk), corpo usa `font-body` (Inter).

| Elemento | Classe | Font |
|---|---|---|
| Hero / titulo de pagina | `font-display text-5xl font-bold tracking-tight` | Tomato Grotesk 48px bold |
| H2 de secao | `font-display text-3xl font-bold tracking-tight` | Tomato Grotesk 30px bold |
| H3 heading de card | `font-display text-xl font-semibold` | Tomato Grotesk 20px semibold |
| H4 subtitulo | `font-display text-lg font-semibold` | Tomato Grotesk 18px semibold |
| Nome de item | `font-body text-base font-semibold` | Inter 16px semibold |
| Corpo / valores | `font-body text-base` | Inter 16px regular |
| Labels de formulario | `font-body text-sm font-medium` | Inter 14px medium |
| Metadata (data, contagem) | `font-body text-sm text-[#858585]` | Inter 14px regular |
| Total destaque | `font-display text-2xl font-bold` | Tomato Grotesk 24px bold |
| Botao CTA | `font-body text-base font-semibold` | Inter 16px semibold |
| Caption / auxiliar | `font-body text-xs text-[#858585]` | Inter 12px regular |

Cores de texto:

| Nivel | Classe | Uso |
|---|---|---|
| Primario | `text-[#1B1B1B]` | Titulos, corpo principal |
| Secundario | `text-[#474747]` | Subtitulos, descricoes |
| Terciario | `text-[#858585]` | Metadata, placeholders, hints |
| Sobre primario | `text-white` | Texto sobre botoes/fundos primarios |

### 9. Transicoes

Todos os elementos interativos devem ter transicoes suaves:

```tsx
// Padrao para hover/active
className="transition-colors duration-200"

// Para sombras e transforms
className="transition-all duration-300"

// Para cards com hover
className="transition-shadow duration-200 hover:shadow-md"
```

---

## Componentes

### Header (paginas publicas)

```tsx
<header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-sm">
  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center h-16">
      <Link className="... mr-auto">
        <ChevronLeft className="h-5 w-5" />
        <span className="font-body text-sm font-medium hidden sm:block">Voltar</span>
      </Link>
      {/* Logo alinhada a direita */}
    </div>
  </div>
</header>
```

### Card de secao

```tsx
<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
  <div className="px-5 py-4 border-b border-[#E8E4DF] flex items-center gap-2">
    <Icon className="h-4 w-4 text-[#0B996E]" />
    <h2 className="font-display text-lg font-semibold text-[#1B1B1B]">Titulo</h2>
  </div>
  <div className="px-5 py-4">
    {/* conteudo */}
  </div>
</div>
```

### Status badge

```tsx
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold
  bg-white shadow-sm border border-amber-300 text-amber-700">
  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
  Recebido
</span>
```

### Toggle (delivery/pickup)

```tsx
<div className="flex bg-[#FFFDF6] rounded-full p-1 gap-1 shadow-inner">
  <button className={`flex-1 py-2 px-4 rounded-full font-body text-sm font-medium transition-all ${
    active
      ? 'bg-white text-[#1B1B1B] shadow-sm'
      : 'text-[#858585] hover:text-[#474747]'
  }`}>
    ...
  </button>
</div>
```

### Botao de quantidade (+/-)

```tsx
<div className="flex items-center bg-white rounded-full shadow-sm border border-[#E8E4DF]">
  <button className="w-9 h-9 flex items-center justify-center rounded-full
    hover:bg-[#F9FFF6] transition-colors">-</button>
  <span className="w-8 text-center font-body font-semibold text-sm">{qty}</span>
  <button className="w-9 h-9 flex items-center justify-center rounded-full
    hover:bg-[#F9FFF6] transition-colors">+</button>
</div>
```

### Botao CTA principal

```tsx
<button className="w-full h-12 rounded-full font-body text-base font-semibold
  bg-[#0B996E] text-white hover:bg-[#006A43] active:bg-[#004228]
  transition-colors cursor-pointer">
  Finalizar pedido
</button>
```

### Input padrao

```tsx
<input className="w-full h-11 rounded-xl border border-[#E8E4DF] bg-white px-4
  font-body text-base text-[#1B1B1B] placeholder:text-[#858585]
  focus:outline-none focus:ring-2 focus:ring-[#006A43]/20 focus:border-[#006A43]
  transition-colors" />
```

### Imagem placeholder

```tsx
// Com imagem
<img className="rounded-2xl object-cover" />

// Sem imagem
<div className="rounded-2xl bg-[#F9FFF6] flex items-center justify-center">
  <Icon className="text-[#858585]" />
</div>
```

### Loading (paginas publicas)

Logo pulsante centralizada em tela cheia. Usar o componente `PublicLoading`.

```tsx
import PublicLoading from "@/components/public-loading";

// Dentro de Suspense ou loading.tsx
<PublicLoading />
```

Renderiza a logo com `width={140} height={140}` e `animate-pulse` sobre `bg-[#FFFDF6]`.

### Header admin (paginas internas)

```tsx
<div className="bg-white shadow-sm">
  <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center gap-4">
        <a href="/admin" className="flex items-center gap-1.5 text-[#858585] hover:text-[#1B1B1B] transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-body text-sm font-medium hidden sm:block">Voltar</span>
        </a>
        <div className="h-6 w-px bg-[#E8E4DF] hidden sm:block" />
        <h1 className="font-display text-base sm:text-lg font-bold text-[#1B1B1B]">Titulo</h1>
      </div>
      {/* Acoes a direita */}
    </div>
  </div>
</div>
```

### SectionCard (modais e paineis)

```tsx
<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
  <div className="px-4 py-3 border-b border-[#E8E4DF] flex items-center gap-2">
    <Icon className="h-4 w-4 text-[#0B996E]" />
    <h3 className="font-display text-sm font-semibold text-[#1B1B1B]">Titulo</h3>
  </div>
  <div className="px-4 py-3">
    {/* conteudo com divide-y divide-[#E8E4DF] */}
  </div>
</div>
```

### InfoRow (linhas de informacao)

```tsx
<div className="flex items-start justify-between py-2">
  <span className="font-body text-sm text-[#858585]">Label</span>
  <span className="font-body text-sm font-medium text-[#1B1B1B] text-right">Valor</span>
</div>
```

### Select/Dropdown

```tsx
<select className="border border-[#E8E4DF] rounded-xl px-4 py-2.5 font-body text-sm
  bg-white text-[#1B1B1B] max-w-[200px] truncate cursor-pointer
  focus:outline-none focus:ring-2 focus:ring-[#006A43]/20 focus:border-[#006A43]">
  <option value="">Selecione</option>
</select>
```

### Truncate para textos longos

```tsx
<div className="min-w-0">
  <h3 className="font-body font-semibold text-sm truncate">Nome muito longo do cliente...</h3>
</div>
```

### Modal padrao (Dialog)

```tsx
<DialogContent className="max-w-3xl p-0 flex flex-col max-h-[90vh] rounded-2xl overflow-hidden">
  {/* Header fixo */}
  <div className="px-6 py-4 border-b border-[#E8E4DF] flex items-center justify-between flex-shrink-0">
    <h2 className="font-display text-lg font-semibold text-[#1B1B1B]">Titulo</h2>
    ...
  </div>
  {/* Body scrollavel */}
  <div className="flex-1 overflow-y-auto bg-[#FFFDF6] p-6">
    ...
  </div>
  {/* Footer opcional */}
  <div className="px-6 py-4 border-t border-[#E8E4DF] flex gap-3 justify-end flex-shrink-0">
    <button className="rounded-full border border-[#E8E4DF] bg-white text-[#1B1B1B] px-6 py-2.5
      font-body text-sm font-semibold hover:bg-[#F9FFF6] transition-colors cursor-pointer">
      Cancelar
    </button>
    <button className="rounded-full bg-[#0B996E] text-white px-6 py-2.5
      font-body text-sm font-semibold hover:bg-[#006A43] transition-colors cursor-pointer">
      Confirmar
    </button>
  </div>
</DialogContent>
```

### Card de feature / destaque

```tsx
<div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
  <div className="w-12 h-12 rounded-2xl bg-[#F9FFF6] flex items-center justify-center">
    <Icon className="w-6 h-6 text-[#0B996E]" />
  </div>
  <h3 className="font-display text-xl font-semibold text-[#1B1B1B]">Titulo</h3>
  <p className="font-body text-base text-[#474747]">Descricao do feature.</p>
</div>
```

---

## Checklist de revisao

Antes de entregar qualquer pagina, verificar:

**Cores e backgrounds**
- [ ] Background da pagina e `bg-[#FFFDF6]` (cream)
- [ ] Nenhum `bg-gray-50`, `bg-gray-100` presente
- [ ] Nenhum `bg-{cor}-50` presente (exceto status de cards e mint 100)
- [ ] Cards usam `bg-white`
- [ ] Textos usam `#1B1B1B` (primario), `#474747` (secundario), `#858585` (terciario)

**Arredondamento**
- [ ] Botoes usam `rounded-full` (pill shape)
- [ ] Cards e modais usam `rounded-2xl`
- [ ] Inputs e selects usam `rounded-xl`
- [ ] Badges e tags usam `rounded-full`
- [ ] Nenhum `rounded-md` ou `rounded-lg` solto

**Sombras e bordas**
- [ ] Cards tem `shadow-sm` (hover `shadow-md` quando interativo)
- [ ] Modais e dropdowns tem `shadow-lg`
- [ ] Bordas usam `border-[#E8E4DF]` quando presentes
- [ ] Nenhum `border-gray-100`, `border-gray-200`, `border-gray-300`

**Tipografia**
- [ ] Titulos usam `font-display` (Tomato Grotesk)
- [ ] Corpo e interface usam `font-body` (Inter)
- [ ] Hierarquia de tamanhos respeitada (hero 5xl > secao 3xl > card xl > body base)
- [ ] Textos longos tem `truncate` para evitar overflow

**Layout**
- [ ] Container publico usa `max-w-[1200px]`
- [ ] Container admin usa `max-w-[1440px]`
- [ ] Header segue padrao sticky com backdrop-blur e shadow

**Interacao**
- [ ] Todos os botoes tem `cursor-pointer` e `transition-colors`
- [ ] Botoes primarios: `bg-[#0B996E]` hover `bg-[#006A43]`
- [ ] Botoes secundarios: `border border-[#E8E4DF] bg-white`
- [ ] Inputs tem focus ring: `focus:ring-2 focus:ring-[#006A43]/20`
- [ ] Nenhum emoji na UI — usar icones Lucide

**Modais**
- [ ] `rounded-2xl` no container
- [ ] Header fixo com `border-b border-[#E8E4DF]`
- [ ] Body scrollavel com `bg-[#FFFDF6]`
- [ ] Footer com botoes pill (rounded-full)
- [ ] Secoes internas usam SectionCard com icone + titulo
