"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Package } from "lucide-react";
import { useSalesByItem } from "../hooks/use-sales-by-item";
import SalesByItemChart from "./sales-by-item-chart";
import SalesByItemTable from "./sales-by-item-table";
import StatementTab from "./statement-tab";

// Vendas > Por Item: uma aba por meio de pagamento (Todos = soma de todos) no formato de extrato.
// Ranking/Top 10 (itens ou grupos) ficam abaixo, só na aba "Todos".
export default function SalesByItemTab() {
  return <StatementTab footer={({ method, startDate, endDate }) => method === "all" ? <ItemRanking startStr={startDate} endStr={endDate} /> : null} />;
}

function ItemRanking({ startStr, endStr }: { startStr: string; endStr: string }) {
  const [view, setView] = useState<"items" | "groups">("items");
  const { items, groups, loading, error } = useSalesByItem(startStr, endStr);
  const currentData = view === "items" ? items : groups;
  const title = view === "items" ? "Itens" : "Grupos";

  if (loading) return <div className="flex items-center justify-center py-10 print:hidden"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (error) return <div className="flex flex-col items-center gap-3 py-10 print:hidden"><AlertTriangle className="h-8 w-8 text-red-500" /><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4 print:hidden" data-testid="item-ranking">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-tomato text-lg font-semibold">Ranking de vendas</h3>
        <div className="flex gap-1" role="group" aria-label="Agrupar ranking">
          <Button variant={view === "items" ? "default" : "outline"} size="sm" onClick={() => setView("items")}>Itens</Button>
          <Button variant={view === "groups" ? "default" : "outline"} size="sm" onClick={() => setView("groups")}>Grupos</Button>
        </div>
      </div>
      {currentData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="font-tomato">Top 10 {title}</CardTitle></CardHeader>
          <CardContent><SalesByItemChart data={currentData} /></CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle className="font-tomato">Ranking de {title}</CardTitle></CardHeader>
        <CardContent>
          {currentData.length > 0 ? <SalesByItemTable data={currentData} /> : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="mb-4 h-12 w-12" />
              <p>Nenhum dado de vendas no período</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
