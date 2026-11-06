"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Customer, customerService } from "@/app/admin/clientes/services/customerService";

interface CustomerSearchInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (customer: Customer) => void;
  placeholder: string;
  // Só busca quando há texto suficiente: telefone conta dígitos, nome conta letras
  mode: "phone" | "name";
  hasError?: boolean;
  inputMode?: "tel" | "text";
  maxLength?: number;
  // Telefone completo que bate com um único cliente já o escolhe, sem tocar na lista
  autoSelectExact?: boolean;
}

const MIN_CHARS = { phone: 4, name: 2 } as const;

const formatCellphone = (digits: string) =>
  digits.length > 10
    ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    : `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

// Campo de texto com lupa que pesquisa clientes da loja e lista os resultados para escolher.
export function CustomerSearchInput({
  id,
  value,
  onChange,
  onSelect,
  placeholder,
  mode,
  hasError,
  inputMode,
  maxLength,
  autoSelectExact,
}: CustomerSearchInputProps) {
  const [results, setResults] = useState<Customer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const requestRef = useRef(0);
  // A busca é assíncrona: usa sempre o callback mais recente, não o do momento da digitação
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const query = mode === "phone" ? value.replace(/\D/g, "") : value.trim();

  const runSearch = async (term: string) => {
    const requestId = ++requestRef.current;
    setLoading(true);
    try {
      const response = await customerService.searchCustomers(term);
      if (requestId !== requestRef.current) return;
      setResults(response.data);
      const exact = response.data.filter((c) => c.attributes.cellphone.replace(/\D/g, "") === term);
      if (autoSelectExact && term.length >= 10 && exact.length === 1) {
        onSelectRef.current(exact[0]);
        setOpen(false);
        return;
      }
      setOpen(true);
    } catch {
      if (requestId !== requestRef.current) return;
      setResults([]);
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  };

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // A busca nasce da digitação do usuário, não de valores preenchidos ao escolher um cliente
  const handleChange = (next: string) => {
    onChange(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    const term = mode === "phone" ? next.replace(/\D/g, "") : next.trim();
    if (term.length < MIN_CHARS[mode]) {
      requestRef.current++;
      setResults(null);
      setOpen(false);
      setLoading(false);
      return;
    }
    timerRef.current = setTimeout(() => runSearch(term), 300);
  };

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSelect = (customer: Customer) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
    onSelectRef.current(customer);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (query.length >= MIN_CHARS[mode]) runSearch(query);
            }
          }}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete="off"
          aria-invalid={hasError || undefined}
          className={cn("h-11", hasError && "border-red-500 focus-visible:ring-red-500")}
        />
        <Button
          type="button"
          variant="outline"
          aria-label={mode === "phone" ? "Buscar cliente pelo telefone" : "Buscar cliente pelo nome"}
          disabled={query.length < MIN_CHARS[mode] || loading}
          onClick={() => runSearch(query)}
          className="h-11 w-11 shrink-0 cursor-pointer border-[#E5E2DD] p-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {open && results && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-md border border-[#E5E2DD] bg-white shadow-lg"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted-foreground" data-testid="customer-no-results">
              Nenhum cliente encontrado. Preencha os dados: o cliente é cadastrado ao finalizar o pedido.
            </li>
          ) : (
            results.map((customer) => (
              <li key={customer.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => handleSelect(customer)}
                  className="flex w-full cursor-pointer flex-col items-start px-3 py-2 text-left hover:bg-[#FAF9F7]"
                >
                  <span className="text-sm font-medium text-gray-900">{customer.attributes.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCellphone(customer.attributes.cellphone.replace(/\D/g, ""))}
                    {customer.attributes.orders_count > 0 &&
                      ` · ${customer.attributes.orders_count} ${customer.attributes.orders_count === 1 ? "pedido" : "pedidos"}`}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
