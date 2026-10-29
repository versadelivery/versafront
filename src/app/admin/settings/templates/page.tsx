"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, Loader2, Minus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ProtectedRoute from "@/components/protected-route";
import { applyCatalogTemplate, getCatalogTemplate, TemplateCategory, TemplateGroup, TemplateSelection } from "@/services/catalog-template-service";
import { getApiErrorMessage } from "@/utils/api-error";

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
const itemId = (category: TemplateCategory, group: TemplateGroup, key: string) => `${category.key}|${group.key}|${key}`;

function Row({ checked, onCheck, title, subtitle, open, onToggle }: {
  checked: boolean | "indeterminate";
  onCheck: () => void;
  title: string;
  subtitle?: string;
  open?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className={`flex min-h-14 items-center gap-3 rounded-md border bg-white px-3 ${open ? "border-primary" : "border-[#E5E2DD]"}`}>
      {checked === "indeterminate" ? (
        <button type="button" role="checkbox" aria-checked="mixed" aria-label={title} onClick={onCheck} className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-primary bg-primary text-primary-foreground sm:size-5">
          <Minus className="size-3.5" />
        </button>
      ) : (
        <Checkbox checked={checked} onCheckedChange={onCheck} className="size-6 sm:size-5" aria-label={title} />
      )}
      <button type="button" onClick={onToggle ?? onCheck} className="flex min-h-11 flex-1 cursor-pointer items-center justify-between gap-2 text-left">
        <span className="min-w-0">
          <span className="block break-words text-sm font-medium text-gray-900">{title}</span>
          {subtitle && <span className="block text-xs text-muted-foreground">{subtitle}</span>}
        </span>
        {onToggle && <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>
    </div>
  );
}

function BulkButtons({ onAll, onNone }: { onAll: () => void; onNone: () => void }) {
  return (
    <div className="flex gap-4 text-xs font-medium text-primary">
      <button type="button" className="min-h-9 cursor-pointer" onClick={onAll}>Marcar todos</button>
      <button type="button" className="min-h-9 cursor-pointer text-muted-foreground" onClick={onNone}>Desmarcar todos</button>
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["catalog-template"], queryFn: getCatalogTemplate, staleTime: Infinity });
  const categories = useMemo(() => data?.categories ?? [], [data]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggleOpen = (key: string, force?: boolean) => setOpen((current) => {
    const next = new Set(current);
    if (force ?? !next.has(key)) next.add(key); else next.delete(key);
    return next;
  });

  const setItems = (ids: string[], on: boolean) => setSelected((current) => {
    const next = new Set(current);
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
    return next;
  });

  const groupIds = (category: TemplateCategory, group: TemplateGroup) => group.items.map((item) => itemId(category, group, item.key));
  const categoryIds = (category: TemplateCategory) => category.groups.flatMap((group) => groupIds(category, group));
  const countOf = (ids: string[]) => ids.filter((id) => selected.has(id)).length;
  const state = (ids: string[]): boolean | "indeterminate" => {
    const count = countOf(ids);
    return count === 0 ? false : count === ids.length ? true : "indeterminate";
  };

  // Marcar um grupo/categoria marca tudo dentro e abre o nivel de baixo; desmarcar limpa
  const toggleGroup = (category: TemplateCategory, group: TemplateGroup) => {
    const on = state(groupIds(category, group)) !== true;
    setItems(groupIds(category, group), on);
    toggleOpen(`${category.key}|${group.key}`, on);
  };
  const toggleCategory = (category: TemplateCategory) => {
    const on = state(categoryIds(category)) !== true;
    setItems(categoryIds(category), on);
    toggleOpen(category.key, on);
  };

  const totals = useMemo(() => {
    const groups = categories.map((category) =>
      category.groups.filter((group) => group.items.some((item) => selected.has(itemId(category, group, item.key)))).length,
    );
    return { categories: groups.filter((count) => count > 0).length, groups: groups.reduce((sum, count) => sum + count, 0), items: selected.size };
  }, [categories, selected]);

  const apply = useMutation({
    mutationFn: () => {
      const selection: TemplateSelection = {};
      categories.forEach((category) => category.groups.forEach((group) => {
        const keys = group.items.filter((item) => selected.has(itemId(category, group, item.key))).map((item) => item.key);
        if (keys.length) (selection[category.key] ??= {})[group.key] = keys;
      }));
      return applyCatalogTemplate(selection);
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      queryClient.invalidateQueries({ queryKey: ["catalog-categories"] });
      toast.success(`${plural(created.items, "item criado", "itens criados")}. Defina os preços para ativá-los.`);
      router.push("/admin/catalog?tab=prices");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erro ao aplicar o template"), { duration: 8000 }),
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FAF9F7] pb-36">
        <div className="border-b border-[#E5E2DD] bg-white">
          <div className="mx-auto max-w-[1920px] px-4 sm:px-6">
            <div className="flex h-16 items-center gap-4">
              <a href="/admin/settings" className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden text-sm font-medium sm:block">Voltar</span>
              </a>
              <div className="hidden h-6 w-px bg-[#E5E2DD] sm:block" />
              <h1 className="font-tomato text-base font-bold text-gray-900 sm:text-lg">Templates de Loja</h1>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-3 px-4 py-6 sm:px-6">
          <div>
            <h2 className="font-tomato text-xl font-bold text-gray-900">Monte sua loja</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Marque o que você vende. Os itens entram no cardápio inativos e sem preço; depois é só definir os preços na aba Ajuste R$. O que você já tem no cardápio não é alterado.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <>
              <BulkButtons onAll={() => setItems(categories.flatMap(categoryIds), true)} onNone={() => setSelected(new Set())} />
              {categories.map((category) => {
                const ids = categoryIds(category);
                const isOpen = open.has(category.key);
                const pickedGroups = category.groups.filter((group) => countOf(groupIds(category, group)) > 0).length;
                const groupsLabel = plural(category.groups.length, "grupo", "grupos");
                return (
                  <div key={category.key} className="space-y-2">
                    <Row
                      open={isOpen} checked={state(ids)} title={category.name}
                      subtitle={pickedGroups ? `${pickedGroups} de ${groupsLabel}` : groupsLabel}
                      onCheck={() => toggleCategory(category)} onToggle={() => toggleOpen(category.key)}
                    />
                    {isOpen && (
                      <div className="ml-3 space-y-2 border-l-2 border-[#E5E2DD] pl-3">
                        <BulkButtons onAll={() => setItems(ids, true)} onNone={() => setItems(ids, false)} />
                        {category.groups.map((group) => {
                          const key = `${category.key}|${group.key}`;
                          const gids = groupIds(category, group);
                          const picked = countOf(gids);
                          const itemsLabel = plural(gids.length, "item", "itens");
                          return (
                            <div key={key} className="space-y-2">
                              <Row
                                open={open.has(key)} checked={state(gids)} title={group.name}
                                subtitle={picked ? `${picked} de ${itemsLabel}` : itemsLabel}
                                onCheck={() => toggleGroup(category, group)} onToggle={() => toggleOpen(key)}
                              />
                              {open.has(key) && (
                                <div className="ml-3 space-y-2 border-l-2 border-[#E5E2DD] pl-3">
                                  <BulkButtons onAll={() => setItems(gids, true)} onNone={() => setItems(gids, false)} />
                                  {group.items.map((item) => {
                                    const id = itemId(category, group, item.key);
                                    return <Row key={id} checked={selected.has(id)} title={item.name} onCheck={() => setItems([id], !selected.has(id))} />;
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
            </>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 border-t border-[#E5E2DD] bg-[#FAF9F7]/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto max-w-3xl space-y-2">
            <p className="text-center text-xs text-muted-foreground">
              {plural(totals.categories, "categoria", "categorias")} · {plural(totals.groups, "grupo", "grupos")} · {plural(totals.items, "item", "itens")}
            </p>
            <Button className="h-12 w-full cursor-pointer text-base" disabled={totals.items === 0 || apply.isPending} onClick={() => apply.mutate()}>
              {apply.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar ao cardápio"}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
