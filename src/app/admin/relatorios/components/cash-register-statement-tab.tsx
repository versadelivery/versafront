"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Scale,
  Receipt,
} from "lucide-react";
import { useCashRegisterStatement } from "../hooks/use-cash-register-statement";
import ReportExportButton from "@/components/admin/report-export-button";
import DateRangePicker from "./date-range-picker";
import CashRegisterStatementTable from "./cash-register-statement-table";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function CashRegisterStatementTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { transactions, summary, loading, error } =
    useCashRegisterStatement(startStr, endStr);

  const handleDateChange = (newStart: Date, newEnd: Date) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
        />
        <ReportExportButton
          filename="extrato-caixa"
          headers={["Data", "Tipo", "Descrição", "Valor"]}
          rows={transactions?.map(d => [d.date_label, d.kind_label, d.description, d.amount]) ?? []}
          summaryData={summary ? { "Total Entradas": summary.total_entries, "Total Saídas": summary.total_exits, "Saldo": summary.balance } : undefined}
          disabled={loading || !transactions}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Entradas
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.total_entries)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <ArrowDownCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Saídas
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.total_exits)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Scale className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.balance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Receipt className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Movimentações
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.transaction_count}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Extrato de Caixa</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <CashRegisterStatementTable data={transactions} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Receipt className="h-12 w-12 mb-4" />
                  <p>Nenhuma movimentação no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
