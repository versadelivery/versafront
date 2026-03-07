"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  UserPlus,
  UserCheck,
  DollarSign,
  Percent,
} from "lucide-react";
import { useCustomerAcquisition } from "../hooks/use-customer-acquisition";
import ReportExportButton from "@/components/admin/report-export-button";
import DateRangePicker from "./date-range-picker";
import CustomerAcquisitionChart from "./customer-acquisition-chart";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function CustomerAcquisitionTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { breakdown, summary, loading, error } = useCustomerAcquisition(
    startStr,
    endStr
  );

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
          filename="aquisicao-clientes"
          headers={["Data", "Novos Clientes"]}
          rows={breakdown?.map(d => [d.label, d.new_customers]) ?? []}
          summaryData={summary ? { "Novos Clientes": summary.new_customers, "Clientes Recorrentes": summary.returning_customers, "% Novos": summary.new_customer_percentage } : undefined}
          disabled={loading || !breakdown}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Novos Clientes
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.new_customers}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <UserCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Clientes Recorrentes
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.returning_customers}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Ticket Médio 1o Pedido
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.average_first_order)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Percent className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      % Novos Clientes
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.new_customer_percentage}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-tomato">Novos Clientes por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              {breakdown.some((d) => d.new_customers > 0) ? (
                <CustomerAcquisitionChart data={breakdown} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mb-4" />
                  <p>Nenhum novo cliente no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
