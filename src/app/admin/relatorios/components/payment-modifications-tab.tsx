"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  CreditCard,
  ShoppingCart,
} from "lucide-react";
import { usePaymentModifications } from "../hooks/use-payment-modifications";
import DateRangePicker from "./date-range-picker";
import PaymentModificationsTable from "./payment-modifications-table";

export default function PaymentModificationsTab() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { modifications, summary, loading, error } = usePaymentModifications(
    startStr,
    endStr
  );

  const handleDateChange = (newStart: Date, newEnd: Date) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  return (
    <div className="space-y-6">
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateChange}
      />

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Alterações
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.total_modifications}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pedidos Afetados
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.total_orders_affected}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Alterações de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              {modifications.length > 0 ? (
                <PaymentModificationsTable data={modifications} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mb-4" />
                  <p>Nenhuma alteração de pagamento no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
