"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { History, TrendingUp, CreditCard, ArrowLeft } from "lucide-react";
import { closeCashRegister, createManualEntry, listCashRegisters, openCashRegister } from "@/services/cash-register-service";

export default function CaixaPage() {
  const [openingValue, setOpeningValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para moedas
  const [coins, setCoins] = useState({
    "0.01": "0",
    "0.05": "0",
    "0.10": "0",
    "0.25": "0",
    "0.50": "0",
    "1.00": "0"
  });

  // Estados para cédulas
  const [bills, setBills] = useState({
    "1.00": "0",
    "2.00": "0",
    "5.00": "0",
    "10.00": "0",
    "20.00": "0",
    "50.00": "0",
    "100.00": "0",
    "200.00": "0"
  });

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const registers = await listCashRegisters();
        const hasOpen = registers.some((r) => !r.closed_at);
        setIsOpen(hasOpen);
      } catch (e) {
        console.error('Erro ao carregar status do caixa:', e);
      }
    };
    loadStatus();
  }, []);

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
      setIsOpen(true);
      setOpeningValue("");
      window.alert("Caixa aberto com sucesso");
    } catch (err: any) {
      console.error('Erro ao abrir caixa:', err);
      const errorMessage = err?.response?.data?.error || err?.message || "Falha ao abrir o caixa";
      window.alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCash = async () => {
    try {
      setLoading(true);
      await closeCashRegister();
      setIsOpen(false);
      window.alert("Caixa fechado com sucesso");
    } catch (err: any) {
      console.error('Erro ao fechar caixa:', err);
      const errorMessage = err?.response?.data?.error || err?.message || "Falha ao fechar o caixa";
      window.alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCoinChange = (denomination: string, value: string) => {
    setCoins(prev => ({
      ...prev,
      [denomination]: value
    }));
  };

  const handleBillChange = (denomination: string, value: string) => {
    setBills(prev => ({
      ...prev,
      [denomination]: value
    }));
  };

  const calculateTotal = () => {
    const coinsTotal = Object.entries(coins).reduce((acc, [denom, qty]) => {
      return acc + (parseFloat(denom) * parseInt(qty || "0"));
    }, 0);

    const billsTotal = Object.entries(bills).reduce((acc, [denom, qty]) => {
      return acc + (parseFloat(denom) * parseInt(qty || "0"));
    }, 0);

    return (coinsTotal + billsTotal).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/admin" className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </a>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">Controle de Caixa</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={isOpen ? "default" : "destructive"}
                className="text-sm"
              >
                {isOpen ? "Aberto" : "Fechado"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-3 mb-6">
          <Button variant="outline" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Entradas e saídas
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Contas a pagar
          </Button>
        </div>

        <div className="max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-tomato">Valor de abertura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end max-w-sm">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Digite o valor"
                    value={openingValue}
                    onChange={(e) => setOpeningValue(e.target.value)}
                    className="text-lg"
                    step="0.01"
                    min="0"
                    disabled={isOpen || loading}
                  />
                </div>
                {!isOpen ? (
                  <Button
                    onClick={handleOpenCash}
                    disabled={!openingValue || parseFloat(openingValue) <= 0 || loading}
                    className="bg-primary hover:bg-primary/80"
                  >
                    {loading ? "Abrindo..." : "Abrir"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleCloseCash}
                    disabled={loading}
                    variant="destructive"
                  >
                    {loading ? "Fechando..." : "Fechar"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-tomato text-md">
                Opcional: informe a quantidade de moedas e cédulas para calcular o caixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Seção de Moedas */}
                <div>
                  <h3 className="font-tomato text-lg font-semibold mb-4 text-gray-700">Moedas</h3>
                  <div className="space-y-3">
                    {Object.entries(coins).map(([denomination, quantity]) => (
                      <div key={denomination} className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-sm">
                          R$ {denomination}
                        </Badge>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => handleCoinChange(denomination, e.target.value)}
                          className="w-20 text-center"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seção de Cédulas */}
                <div>
                  <h3 className="font-tomato text-lg font-semibold mb-4 text-gray-700">Cédulas</h3>
                  <div className="space-y-3">
                    {Object.entries(bills).map(([denomination, quantity]) => (
                      <div key={denomination} className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-sm">
                          R$ {denomination}
                        </Badge>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => handleBillChange(denomination, e.target.value)}
                          className="w-20 text-center"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total calculado */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Total calculado:</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {calculateTotal()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
