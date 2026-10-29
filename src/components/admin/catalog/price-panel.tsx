"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useCatalogGroup } from "@/hooks/useCatalogGroup";
import { useCatalogCategories } from "@/hooks/useCatalogCategories";
import { bulkUpdateItems, PriceRow } from "@/services/catalog-template-service";
import { getApiErrorMessage } from "@/utils/api-error";

type Filter = "all" | "no-price" | "inactive";
type Draft = { price: string; active: boolean };
type Row = { id: string; name: string; unit: string; price: string; active: boolean };
type Group = { id: string; name: string; categoryId: string | null; items: Row[] };

const UNITS: Record<string, string> = { unit: "un", weight_per_kg: "kg", weight_per_g: "g" };
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "no-price", label: "Sem preço" },
  { value: "inactive", label: "Inativos" },
];

const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
// "1.234,50" (milhar com ponto, decimal com virgula) ou "38.9" (so ponto)
const toNumber = (text: string) => Number(text.includes(",") ? text.replaceAll(".", "").replace(",", ".") : text);
const toCents = (text: string) => Math.round(toNumber(text) * 100 + 1e-8);
const hasPrice = (price: string) => toNumber(price) > 0;
const fromApi = (price: number | null | undefined) => (price == null ? "" : Number(price).toFixed(2).replace(".", ","));
const without = <T,>(record: Record<string, T>, key: string) => Object.fromEntries(Object.entries(record).filter(([id]) => id !== key));
const activeCount = (rows: Row[]) => rows.filter((row) => row.active).length;

export function PricePanel() {
  const queryClient = useQueryClient();
  const { catalog, isLoading } = useCatalogGroup();
  const { categories } = useCatalogCategories();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());

  // categoria > grupo > item, com o rascunho (se houver) sobre o valor salvo
  const { tree, originals } = useMemo(() => {
    const originals: Record<string, Draft> = {};
    const groups: Group[] = [...(catalog?.data ?? [])]
      .filter((group: any) => group?.attributes?.name)
      .sort((a: any, b: any) => (a.attributes.priority || 0) - (b.attributes.priority || 0))
        .map((group: any): Group => {
        const raw: any = group.attributes.items;
        const nodes: any[] = (Array.isArray(raw) ? raw : raw?.data ?? []).map((item: any) => item?.data ?? item);
        const items = nodes.map((node): Row => {
          const original = { price: fromApi(node.attributes.price), active: !!node.attributes.active };
          originals[node.id] = original;
          return { id: String(node.id), name: node.attributes.name as string, unit: UNITS[node.attributes.item_type] ?? "un", ...original };
        });
        return { id: String(group.id), name: group.attributes.name as string, categoryId: group.attributes.catalog_category_id ? String(group.attributes.catalog_category_id) : null, items };
      });

    const named: { id: string; name: string }[] = (categories ?? []).map((category: any) => ({ id: String(category.id), name: category.attributes.name as string }));
    const sections = [...named, { id: "none", name: "Sem categoria" }].map((category) => ({
      ...category,
      groups: groups.filter((group) => (group.categoryId ?? "none") === category.id),
    }));
    return { tree: sections.filter((category) => category.groups.length > 0), originals };
  }, [catalog, categories]);

  // item so conta como ativo com preco valido; o rascunho guarda a escolha do lojista (apagar o preco e digitar de novo nao desativa)
  const effective = (row: Row): Row => {
    const draft = drafts[row.id];
    return draft ? { ...row, price: draft.price, active: draft.active && hasPrice(draft.price) } : row;
  };
  const search = normalize(query.trim());
  const filtering = filter !== "all" || search !== "";
  const visible = (row: Row) => {
    const current = effective(row);
    if (search && !normalize(row.name).includes(search)) return false;
    if (drafts[row.id]) return true; // linha em edicao nao some do filtro
    if (filter === "no-price") return !hasPrice(current.price);
    if (filter === "inactive") return !current.active;
    return true;
  };

  const setDraft = (row: Row, patch: Partial<Draft>) => {
    setErrors((current) => without(current, row.id));
    setDrafts((current) => {
      const next = { ...(current[row.id] ?? originals[row.id]), ...patch };
      const original = originals[row.id];
      const rest = without(current, row.id);
      return original && original.price === next.price && original.active === next.active ? rest : { ...rest, [row.id]: { price: next.price, active: next.active } };
    });
  };

  // "ativar todos com preco" no escopo (grupo, categoria ou tudo o que o filtro mostra)
  const activateWithPrice = (rows: Row[]) => {
    const targets = rows.filter(visible).filter((row) => hasPrice(effective(row).price) && !effective(row).active);
    if (!targets.length) return toast.info("Nenhum item com preço para ativar");
    targets.forEach((row) => setDraft(row, { active: true }));
    toast.success(`${targets.length} ${targets.length === 1 ? "item será ativado" : "itens serão ativados"}. Salve para confirmar.`);
  };

  const toggleOpen = (key: string) => setOpen((current) => {
    const next = new Set(current);
    if (!next.delete(key)) next.add(key);
    return next;
  });

  const changed = Object.keys(drafts);
  const save = useMutation({
    mutationFn: (rows: PriceRow[]) => bulkUpdateItems(rows),
    onSuccess: async (_, rows) => {
      await queryClient.invalidateQueries({ queryKey: ["catalog"] });
      const sent = new Set(rows.map((row) => row.id));
      setDrafts((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !sent.has(id))));
      setErrors({});
      toast.success("Preços salvos");
    },
    onError: (error: any) => {
      setErrors(error?.response?.data?.errors ?? {});
      // item apagado em outro lugar nao pode travar o salvamento: descarta o rascunho dele
      setDrafts((current) => Object.fromEntries(Object.entries(current).filter(([id]) => originals[id])));
      toast.error(getApiErrorMessage(error, "Erro ao salvar os preços"), { duration: 8000 });
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const allRows = tree.flatMap((category) => category.groups.flatMap((group) => group.items));

  return (
    <div className="mx-auto max-w-3xl space-y-3 pb-28">
      <div>
        <h2 className="font-tomato text-xl font-bold text-gray-900">Preços e status</h2>
        <p className="text-sm text-muted-foreground">Ajuste os preços de todos os itens e ative os que já estão prontos. Preencher o preço não ativa o item.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar item" className="h-11 bg-white pl-9" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value} type="button" onClick={() => setFilter(value)}
            className={`min-h-10 cursor-pointer rounded-full border px-4 text-sm font-medium ${filter === value ? "border-primary bg-primary text-primary-foreground" : "border-[#E5E2DD] bg-white text-gray-700"}`}
          >
            {label}
          </button>
        ))}
        <button type="button" onClick={() => activateWithPrice(allRows)} className="ml-auto min-h-10 cursor-pointer text-sm font-medium text-primary">
          Ativar todos com preço
        </button>
      </div>

      {tree.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhum item no cardápio ainda. Use Templates de Loja em Configurações para começar rápido.</p>}

      {tree.map((category) => {
        const groups = category.groups.map((group) => ({ ...group, rows: group.items.filter(visible) })).filter((group) => !filtering || group.rows.length > 0);
        if (groups.length === 0) return null;
        const categoryRows = category.groups.flatMap((group) => group.items.map(effective));
        const categoryOpen = filtering || open.has(category.id);
        return (
          <div key={category.id} className="space-y-2">
            <button
              type="button" onClick={() => toggleOpen(category.id)} aria-expanded={categoryOpen}
              className={`flex min-h-14 w-full cursor-pointer items-center justify-between gap-2 rounded-md border bg-white px-3 text-left ${categoryOpen ? "border-primary" : "border-[#E5E2DD]"}`}
            >
              <span>
                <span className="block text-sm font-semibold text-gray-900">{category.name}</span>
                <span className="block text-xs text-muted-foreground">{activeCount(categoryRows)} de {categoryRows.length} ativos</span>
              </span>
              <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
            </button>

            {categoryOpen && (
              <div className="ml-3 space-y-2 border-l-2 border-[#E5E2DD] pl-3">
                {groups.map((group) => {
                  const groupRows = group.items.map(effective);
                  const groupOpen = filtering || open.has(group.id);
                  return (
                    <div key={group.id} className="space-y-2">
                      <div className={`flex min-h-14 items-center gap-2 rounded-md border bg-white pr-2 ${groupOpen ? "border-primary" : "border-[#E5E2DD]"}`}>
                        <button type="button" onClick={() => toggleOpen(group.id)} aria-expanded={groupOpen} className="flex min-h-14 flex-1 cursor-pointer items-center justify-between gap-2 px-3 text-left">
                          <span>
                            <span className="block text-sm font-medium text-gray-900">{group.name}</span>
                            <span className="block text-xs text-muted-foreground">{activeCount(groupRows)} de {groupRows.length} ativos</span>
                          </span>
                          <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${groupOpen ? "rotate-180" : ""}`} />
                        </button>
                        <button type="button" onClick={() => activateWithPrice(group.items)} className="min-h-11 shrink-0 cursor-pointer px-2 text-xs font-medium text-primary">
                          Ativar com preço
                        </button>
                      </div>

                      {groupOpen && (
                        <div className="ml-3 space-y-2 border-l-2 border-[#E5E2DD] pl-3">
                          {group.rows.map((row) => {
                            const current = effective(row);
                            const priced = hasPrice(current.price);
                            const message = errors[row.id] ?? (!current.active && !priced ? "Defina o preço para ativar" : null);
                            return (
                              <div key={row.id} className={`rounded-md border bg-white p-3 ${drafts[row.id] ? "border-primary/60" : "border-[#E5E2DD]"} ${errors[row.id] ? "border-destructive" : ""}`}>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="min-w-0 break-words text-sm font-medium text-gray-900">{row.name}</span>
                                  <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                                    <Checkbox
                                      checked={current.active} disabled={!priced} className="size-6 sm:size-5"
                                      onCheckedChange={(value) => setDraft(row, { active: value === true })}
                                    />
                                    {current.active ? "Ativo" : "Inativo"}
                                  </label>
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                  <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                                    <Input
                                      inputMode="decimal" placeholder="0,00" aria-label={`Preço de ${row.name}`}
                                      value={current.price} className="h-11 pl-10 text-right tabular-nums"
                                      onChange={(event) => setDraft(row, { price: event.target.value.replace(/[^\d,.]/g, "") })}
                                      onBlur={() => priced && setDraft(row, { price: fromApi(toCents(current.price) / 100) })}
                                    />
                                  </div>
                                  <span className="w-8 shrink-0 text-sm text-muted-foreground">/{row.unit}</span>
                                </div>
                                {message && <p className="mt-1 text-xs text-destructive">{message}</p>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E5E2DD] bg-[#FAF9F7]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-2">
          {changed.length > 0 && !save.isPending && (
            <Button variant="outline" className="h-12 cursor-pointer" onClick={() => { setDrafts({}); setErrors({}); }}>Descartar</Button>
          )}
          <Button className="h-12 flex-1 cursor-pointer text-base" disabled={changed.length === 0 || save.isPending} onClick={() => save.mutate(changed.map((id) => ({ id, price: hasPrice(drafts[id].price) ? toCents(drafts[id].price) / 100 : null, active: drafts[id].active && hasPrice(drafts[id].price) })))}>
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : changed.length ? `Salvar alterações (${changed.length})` : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
