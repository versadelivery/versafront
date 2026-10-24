import Image from "next/image";
import {
  Check,
  Clock,
  Home,
  MapPin,
  PackageCheck,
  Plus,
  Scale,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Telas ilustrativas do VersaDelivery desenhadas em código. Decorativas (aria-hidden).

const shadow = "shadow-[0_24px_50px_-24px_rgba(27,27,27,.35)]";

function Window({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "mx-auto w-full max-w-[460px] overflow-hidden rounded-2xl border border-[#E8E4DF] bg-white",
        shadow,
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-[#E8E4DF] bg-[#FAF8F3] px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#F2A7A0]" />
        <span className="size-2.5 rounded-full bg-[#F4D58D]" />
        <span className="size-2.5 rounded-full bg-[#A8DC97]" />
        <span className="ml-3 truncate text-[11px] font-medium text-[#858585]">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

const products = [
  { name: "Picanha bovina", price: "R$ 69,90", image: "/img/picanha.jpg" },
  { name: "Peito de frango", price: "R$ 18,90", image: "/img/peito-de-frango.jpg" },
  { name: "Cubos de acém", price: "R$ 42,90", image: "/img/meat.png" },
];

export function StorePhone({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "mx-auto w-full max-w-[280px] overflow-hidden rounded-[2.2rem] border-[7px] border-[#1B1B1B] bg-white",
        shadow,
        className
      )}
    >
      <div className="bg-[#16663A] px-4 pb-4 pt-6 text-white">
        <div className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-white text-sm font-bold text-[#009246]">
            BB
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">Açougue Boi Bom</p>
            <p className="text-[11px] text-[#9BF07C]">Aberto agora · 30–45 min</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-hidden text-[11px] font-medium">
          <span className="rounded-full bg-white px-3 py-1 text-[#16663A]">Tudo</span>
          <span className="rounded-full bg-white/15 px-3 py-1">Bovinos</span>
          <span className="rounded-full bg-white/15 px-3 py-1">Aves</span>
        </div>
      </div>

      <ul className="divide-y divide-[#F0ECE5] px-3">
        {products.map((p) => (
          <li key={p.name} className="flex items-center gap-3 py-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#F4F1EA]">
              <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-[#1B1B1B]">{p.name}</p>
              <p className="text-[11px] text-[#858585]">Venda por peso</p>
              <p className="text-[13px] font-semibold text-[#009246]">{p.price}/kg</p>
            </div>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#1B1B1B] text-white">
              <Plus className="size-4" />
            </span>
          </li>
        ))}
      </ul>

      <div className="p-3">
        <div className="flex items-center justify-between rounded-xl bg-[#009246] px-4 py-3 text-[13px] font-semibold text-white">
          <span>Ver carrinho · 3 itens</span>
          <span>R$ 131,70</span>
        </div>
      </div>
    </div>
  );
}

export function WeighWindow({ className }: { className?: string }) {
  return (
    <Window title="Painel · Pedido #1042" className={className}>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1B1B1B]">Pedido #1042 · Maria S.</p>
            <p className="text-[11px] text-[#858585]">Entrega por bairro · há 4 min</p>
          </div>
          <span className="rounded-full bg-[#FFF4D6] px-2.5 py-1 text-[11px] font-semibold text-[#8A6100]">
            Em separação
          </span>
        </div>

        <div className="rounded-xl border border-[#E8E4DF] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#1B1B1B]">Picanha bovina</p>
            <p className="text-[11px] text-[#858585]">Pedido: 1,000 kg</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-[#F1FBE9] px-3 py-2">
              <p className="flex items-center gap-1 text-[10px] font-medium text-[#006A43]">
                <Scale className="size-3" /> Peso real
              </p>
              <p className="text-lg font-semibold text-[#1B1B1B]">1,125 kg</p>
            </div>
            <div className="rounded-lg bg-[#F4F1EA] px-3 py-2">
              <p className="text-[10px] font-medium text-[#858585]">Valor atualizado</p>
              <p className="text-lg font-semibold text-[#1B1B1B]">R$ 78,64</p>
              <p className="text-[10px] text-[#858585] line-through">R$ 69,90</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[#E8E4DF] px-4 py-3">
          <p className="text-[13px] font-semibold text-[#1B1B1B]">Peito de frango · 2 un</p>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#009246]">
            <Check className="size-3.5" /> Conferido
          </span>
        </div>

        <div className="rounded-xl bg-[#1B1B1B] py-3 text-center text-[13px] font-semibold text-white">
          Confirmar pesagem
        </div>
      </div>
    </Window>
  );
}

const kdsColumns = [
  { title: "Novos", tone: "bg-[#EAF2FF] text-[#2676C0]", cards: [["#1044", "João", "2 itens"], ["#1045", "Ana", "4 itens"]] },
  { title: "Em separação", tone: "bg-[#FFF4D6] text-[#8A6100]", cards: [["#1042", "Maria", "2 itens"], ["#1043", "Carlos", "1 item"]] },
  { title: "Prontos", tone: "bg-[#E4F6DC] text-[#006A43]", cards: [["#1041", "Paula", "3 itens"]] },
];

export function KdsWindow({ className }: { className?: string }) {
  return (
    <Window title="Painel · Pedidos ao vivo" className={cn("max-w-[520px]", className)}>
      <div className="grid grid-cols-3 gap-2 bg-[#FAF8F3] p-3 sm:gap-3 sm:p-4">
        {kdsColumns.map((col) => (
          <div key={col.title} className="min-w-0 space-y-2">
            <p className={cn("truncate rounded-md px-2 py-1 text-[10px] font-semibold sm:text-[11px]", col.tone)}>
              {col.title}
            </p>
            {col.cards.map(([id, name, items]) => (
              <div key={id} className="rounded-lg border border-[#E8E4DF] bg-white p-2 sm:p-3">
                <p className="truncate text-[11px] font-semibold text-[#1B1B1B] sm:text-xs">{id} · {name}</p>
                <p className="text-[10px] text-[#858585]">{items}</p>
                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-[#858585]">
                  <Clock className="size-3" /> há 3 min
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Window>
  );
}

const timeline = [
  { icon: Check, label: "Pedido recebido", done: true },
  { icon: Scale, label: "Pesagem concluída", done: true },
  { icon: PackageCheck, label: "Pedido separado", done: true },
  { icon: Truck, label: "Saiu para entrega", current: true },
  { icon: Home, label: "Entregue" },
];

export function DeliveryWindow({ className }: { className?: string }) {
  return (
    <Window title="Pedido #1042 · Acompanhamento" className={cn("max-w-[420px]", className)}>
      <div className="p-5">
        <ol className="space-y-4">
          {timeline.map((step, i) => {
            const Icon = step.icon;
            const active = step.done || step.current;
            return (
              <li key={step.label} className="relative flex items-center gap-3">
                {i < timeline.length - 1 && (
                  <span
                    className={cn(
                      "absolute left-[15px] top-8 h-4 w-0.5",
                      step.done ? "bg-[#009246]" : "bg-[#E8E4DF]"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full",
                    active ? "bg-[#009246] text-white" : "bg-[#F4F1EA] text-[#B5B0A6]",
                    step.current && "ring-4 ring-[#009246]/20"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span
                  className={cn(
                    "text-[13px]",
                    active ? "font-semibold text-[#1B1B1B]" : "text-[#858585]"
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-[#F0ECE5] pt-4 text-[11px] font-medium text-[#474747]">
          <span className="flex items-center gap-1 rounded-full bg-[#F4F1EA] px-3 py-1">
            <MapPin className="size-3" /> Por bairro
          </span>
          <span className="flex items-center gap-1 rounded-full bg-[#F4F1EA] px-3 py-1">
            <Clock className="size-3" /> 30–45 min
          </span>
          <span className="rounded-full bg-[#F4F1EA] px-3 py-1">R$ 20,00</span>
        </div>
      </div>
    </Window>
  );
}

export function WeightCompare({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "mx-auto w-full max-w-[420px] rounded-2xl border border-[#E8E4DF] bg-white p-5",
        shadow,
        className
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#858585]">
        Picanha bovina · R$ 69,90/kg
      </p>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="rounded-xl bg-[#F4F1EA] p-4">
          <p className="text-[11px] text-[#858585]">Cliente pediu</p>
          <p className="text-xl font-semibold text-[#1B1B1B]">1,000 kg</p>
          <p className="text-xs text-[#474747]">R$ 69,90</p>
        </div>
        <Scale className="size-5 text-[#009246]" />
        <div className="rounded-xl bg-[#F1FBE9] p-4 ring-1 ring-[#C0FFA5]">
          <p className="text-[11px] text-[#006A43]">Peso real</p>
          <p className="text-xl font-semibold text-[#1B1B1B]">1,125 kg</p>
          <p className="text-xs font-semibold text-[#006A43]">R$ 78,64</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-[#858585]">
        O cliente vê o peso e o valor atualizados no pedido.
      </p>
    </div>
  );
}

export function BrandCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "mx-auto w-full max-w-[380px] overflow-hidden rounded-2xl border border-[#E8E4DF] bg-white",
        shadow,
        className
      )}
    >
      <div className="h-20 bg-[#16663A]" />
      <div className="-mt-8 px-5 pb-5">
        <div className="grid size-16 place-items-center rounded-2xl border-4 border-white bg-[#F1FBE9] text-xs font-semibold text-[#009246]">
          Sua logo
        </div>
        <p className="mt-3 text-base font-semibold text-[#1B1B1B]">Nome do seu açougue</p>
        <p className="text-xs text-[#858585]">Seg a sáb · 7h às 19h</p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-[#474747]">
          <span className="rounded-full bg-[#F4F1EA] px-3 py-1">Taxa por bairro</span>
          <span className="rounded-full bg-[#F4F1EA] px-3 py-1">Rota de entrega</span>
          <span className="rounded-full bg-[#F4F1EA] px-3 py-1">Seus produtos</span>
        </div>
      </div>
    </div>
  );
}
