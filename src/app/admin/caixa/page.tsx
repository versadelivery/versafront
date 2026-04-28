"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  History,
  TrendingUp,
  ArrowLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronDown,
  ChevronUp,
  Calculator,
} from "lucide-react";
import {
  closeCashRegister,
  createManualEntry,
  listCashRegisters,
  openCashRegister,
  CashRegister,
  CashRegisterTransaction,
} from "@/services/cash-register-service";

type View = "caixa" | "historico" | "movimentacoes";

const KIND_LABELS: Record<string, string> = {
  opening: "Abertura",
  manual_entry: "Entrada Manual",
  order_pix: "Pedido (Pix)",
  order_credit: "Pedido (Crédito)",
  order_debit: "Pedido (Débito)",
  order_cash: "Pedido (Dinheiro)",
  order_canceled: "Pedido Cancelado",
  draw_pix: "Sangria (Pix)",
  draw_cash: "Sangria (Dinheiro)",
};

const EXIT_KINDS = ["order_canceled", "draw_pix", "draw_cash"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RegisterSummary({ transactions }: { transactions: CashRegisterTransaction[] }) {
  const totalEntries = transactions
    .filter((t) => !EXIT_KINDS.includes(t.kind))
    .reduce((s, t) => s + t.amount, 0);
  const totalExits = transactions
    .filter((t) => EXIT_KINDS.includes(t.kind))
    .reduce((s, t) => s + t.amount, 0);
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <div className="text-center">
        <p className="text-muted-foreground text-xs">Entradas</p>
        <p className="font-semibold text-emerald-600">{formatCurrency(totalEntries)}</p>
      </div>
      <div className="text-center">
        <p className="text-muted-foreground text-xs">Saídas</p>
        <p className="font-semibold text-red-500">{formatCurrency(totalExits)}</p>
      </div>
      <div className="text-center">
        <p className="text-muted-foreground text-xs">Saldo</p>
        <p className="font-semibold text-blue-600">{formatCurrency(totalEntries - totalExits)}</p>
      </div>
    </div>
  );
}

function TransactionList({ transactions }: { transactions: CashRegisterTransaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-muted-foreground text-sm text-center py-4">Nenhuma movimentação</p>;
  }
  return (
    <div className="divide-y divide-border">
      {transactions.map((t) => {
        const isExit = EXIT_KINDS.includes(t.kind);
        return (
          <div key={t.id} className="flex items-center gap-3 py-3">
            <div className={`p-1.5 rounded-full ${isExit ? "bg-red-50" : "bg-emerald-50"}`}>
              {isExit ? (
                <ArrowDownCircle className="h-4 w-4 text-red-500" />
              ) : (
                <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{KIND_LABELS[t.kind] ?? t.kind}</p>
              {t.description && (
                <p className="text-xs text-muted-foreground truncate">{t.description}</p>
              )}
              {t.created_at && (
                <p className="text-xs text-muted-foreground">{formatDate(t.created_at)}</p>
              )}
            </div>
            <span className={`text-sm font-semibold ${isExit ? "text-red-500" : "text-emerald-600"}`}>
              {isExit ? "-" : "+"}{formatCurrency(t.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function CaixaPage() {
  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [openingValue, setOpeningValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("caixa");
  const [expandedRegister, setExpandedRegister] = useState<string | number | null>(null);
  const [entryKind, setEntryKind] = useState<"manual_entry" | "draw_cash" | "draw_pix">("manual_entry");
  const [entryAmount, setEntryAmount] = useState("");
  const [entryDescription, setEntryDescription] = useState("");
  const [entryLoading, setEntryLoading] = useState(false);

  // Coins/bills calculator
  const [showCalculator, setShowCalculator] = useState(false);
  const [coins, setCoins] = useState<Record<string, string>>({
    "0.01": "0", "0.05": "0", "0.10": "0", "0.25": "0", "0.50": "0", "1.00": "0",
  });
  const [bills, setBills] = useState<Record<string, string>>({
    "1.00": "0", "2.00": "0", "5.00": "0", "10.00": "0",
    "20.00": "0", "50.00": "0", "100.00": "0", "200.00": "0",
  });

  const loadRegisters = useCallback(async () => {
    try {
      const data = await listCashRegisters();
      setRegisters(data);
    } catch (e) {
      console.error("Erro ao carregar caixas:", e);
    }
  }, []);

  useEffect(() => {
    loadRegisters();
  }, [loadRegisters]);

  const currentRegister = registers.find((r) => r.closed_at === null) ?? null;
  const isOpen = !!currentRegister;

  const handleOpenCash = async () => {
    if (!openingValue || parseFloat(openingValue) <= 0) return;
    try {
      setLoading(true);
      await openCashRegister();
      await createManualEntry({
        kind: "opening",
        amount: parseFloat(openingValue),
        description: "Abertura de caixa",
      });
      setOpeningValue("");
      await loadRegisters();
      window.alert("Caixa aberto com sucesso");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Falha ao abrir o caixa";
      window.alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCash = async () => {
    if (!window.confirm("Tem certeza que deseja fechar o caixa?")) return;
    try {
      setLoading(true);
      await closeCashRegister();
      await loadRegisters();
      window.alert("Caixa fechado com sucesso");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Falha ao fechar o caixa";
      window.alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const c = Object.entries(coins).reduce((acc, [d, q]) => acc + parseFloat(d) * parseInt(q || "0"), 0);
    const b = Object.entries(bills).reduce((acc, [d, q]) => acc + parseFloat(d) * parseInt(q || "0"), 0);
    return (c + b).toFixed(2);
  };

  const handleUseCalculatorValue = () => {
    setOpeningValue(calculateTotal());
    setShowCalculator(false);
  };

  const handleNewEntry = async () => {
    const amount = parseFloat(entryAmount);
    if (!amount || amount <= 0) return;
    try {
      setEntryLoading(true);
      await createManualEntry({ kind: entryKind, amount, description: entryDescription || undefined });
      setEntryAmount("");
      setEntryDescription("");
      await loadRegisters();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Erro ao registrar movimentação";
      window.alert(msg);
    } finally {
      setEntryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </a>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">
                Controle de Caixa
              </h1>
            </div>
            <Badge variant={isOpen ? "default" : "destructive"} className="text-sm">
              {isOpen ? "Aberto" : "Fechado"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6">
        {/* Nav buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            variant={view === "caixa" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setView("caixa")}
          >
            <TrendingUp className="w-4 h-4" />
            Caixa
          </Button>
          <Button
            variant={view === "movimentacoes" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setView("movimentacoes")}
          >
            <ArrowUpCircle className="w-4 h-4" />
            Entradas e saídas
          </Button>
          <Button
            variant={view === "historico" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setView("historico")}
          >
            <History className="w-4 h-4" />
            Histórico
          </Button>
        </div>

        {/* ── Caixa view ── */}
        {view === "caixa" && (
          <div className="max-w-4xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-tomato">
                  {isOpen ? "Fechar Caixa" : "Abrir Caixa"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isOpen && currentRegister ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Aberto em {formatDate(currentRegister.opened_at)}
                    </p>
                    <RegisterSummary transactions={currentRegister.transactions} />
                    <Button
                      onClick={handleCloseCash}
                      disabled={loading}
                      variant="destructive"
                    >
                      {loading ? "Fechando..." : "Fechar Caixa"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-sm">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Valor de abertura</label>
                      <Input
                        type="number"
                        placeholder="Digite o valor"
                        value={openingValue}
                        onChange={(e) => setOpeningValue(e.target.value)}
                        className="text-lg"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-sm text-primary font-medium"
                      onClick={() => setShowCalculator(!showCalculator)}
                    >
                      <Calculator className="w-4 h-4" />
                      {showCalculator ? "Ocultar calculadora" : "Usar calculadora de notas"}
                    </button>

                    {showCalculator && (
                      <div className="border border-border rounded-lg p-4 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Moedas</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(coins).map(([d, q]) => (
                              <div key={d} className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs w-14 justify-center">R$ {d}</Badge>
                                <Input
                                  type="number"
                                  value={q}
                                  onChange={(e) => setCoins((p) => ({ ...p, [d]: e.target.value }))}
                                  className="h-8 w-16 text-center text-sm"
                                  min="0"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cédulas</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(bills).map(([d, q]) => (
                              <div key={d} className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs w-14 justify-center">R$ {d}</Badge>
                                <Input
                                  type="number"
                                  value={q}
                                  onChange={(e) => setBills((p) => ({ ...p, [d]: e.target.value }))}
                                  className="h-8 w-16 text-center text-sm"
                                  min="0"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t pt-3">
                          <span className="text-sm font-medium">Total</span>
                          <span className="text-lg font-bold text-emerald-600">R$ {calculateTotal()}</span>
                        </div>
                        <Button size="sm" variant="outline" onClick={handleUseCalculatorValue} className="w-full">
                          Usar este valor
                        </Button>
                      </div>
                    )}

                    <Button
                      onClick={handleOpenCash}
                      disabled={!openingValue || parseFloat(openingValue) <= 0 || loading}
                      className="bg-primary hover:bg-primary/80"
                    >
                      {loading ? "Abrindo..." : "Abrir Caixa"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Entradas e saídas view ── */}
        {view === "movimentacoes" && (
          <div className="max-w-4xl space-y-4">
            {!currentRegister ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ArrowUpCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum caixa aberto no momento</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Nova movimentação */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-tomato">Nova Movimentação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Tipo</label>
                        <select
                          value={entryKind}
                          onChange={(e) => setEntryKind(e.target.value as typeof entryKind)}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="manual_entry">Entrada Manual</option>
                          <option value="draw_cash">Sangria (Dinheiro)</option>
                          <option value="draw_pix">Sangria (Pix)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Valor (R$)</label>
                        <Input
                          type="number"
                          placeholder="0,00"
                          value={entryAmount}
                          onChange={(e) => setEntryAmount(e.target.value)}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Descrição</label>
                        <Input
                          placeholder="Opcional"
                          value={entryDescription}
                          onChange={(e) => setEntryDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      className="mt-4"
                      onClick={handleNewEntry}
                      disabled={!entryAmount || parseFloat(entryAmount) <= 0 || entryLoading}
                    >
                      {entryLoading ? "Registrando..." : "Registrar"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Lista de movimentações */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-tomato">Movimentações do Caixa Atual</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Aberto em {formatDate(currentRegister.opened_at)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RegisterSummary transactions={currentRegister.transactions} />
                    <div className="border-t pt-4">
                      <TransactionList transactions={currentRegister.transactions} />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* ── Histórico view ── */}
        {view === "historico" && (
          <div className="max-w-4xl space-y-4">
            {registers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum caixa registrado</p>
                </CardContent>
              </Card>
            ) : (
              registers.map((reg) => {
                const isCurrent = reg.closed_at === null;
                const isExpanded = expandedRegister === reg.id;
                return (
                  <Card key={reg.id} className={isCurrent ? "border-primary/50" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={isCurrent ? "default" : "secondary"}>
                              {isCurrent ? "Aberto" : "Fechado"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Abertura: {formatDate(reg.opened_at)}
                          </p>
                          {reg.closed_at && (
                            <p className="text-sm text-muted-foreground">
                              Fechamento: {formatDate(reg.closed_at)}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedRegister(isExpanded ? null : reg.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <RegisterSummary transactions={reg.transactions} />
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="pt-0">
                        <div className="border-t pt-4">
                          <TransactionList transactions={reg.transactions} />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
